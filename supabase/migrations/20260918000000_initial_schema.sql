-- FindBack initial schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.
-- Filename is timestamp-prefixed so `supabase db push` orders it correctly
-- relative to later migrations (e.g. 20260919000000_add_report_geolocation.sql).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- items
-- ---------------------------------------------------------------------------
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  public_token text not null unique,
  recovery_code text not null unique,
  name text not null check (char_length(name) between 1 and 60),
  category text not null check (
    category in ('우산', '물병/텀블러', '가방', '지갑', '열쇠', '전자기기', '필통', '기타')
  ),
  description text check (char_length(description) <= 300),
  -- Optional owner-authored instructions for how a finder should return the item.
  return_instructions text check (char_length(return_instructions) <= 200),
  photo_url text,
  status text not null default 'safe' check (status in ('safe', 'lost', 'found', 'returned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_owner_id_idx on public.items (owner_id);
create index if not exists items_public_token_idx on public.items (public_token);
create index if not exists items_recovery_code_idx on public.items (recovery_code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- found_reports
-- ---------------------------------------------------------------------------
create table if not exists public.found_reports (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  location_text text check (char_length(location_text) <= 200),
  return_method text not null check (
    return_method in ('location_only', 'security_office', 'information_desk', 'lost_and_found', 'other')
  ),
  custom_return_place text check (char_length(custom_return_place) <= 200),
  message text check (char_length(message) <= 500),
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists found_reports_item_id_idx on public.found_reports (item_id);

-- ---------------------------------------------------------------------------
-- item_status_events: powers the "등록 / 분실 / 반환" timeline on the item
-- page. found_reports rows already carry their own created_at, so a "발견
-- 제보 받음" timeline entry is read directly from found_reports instead of
-- being duplicated here.
-- ---------------------------------------------------------------------------
create table if not exists public.item_status_events (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  event_type text not null check (event_type in ('lost', 'returned')),
  created_at timestamptz not null default now()
);

create index if not exists item_status_events_item_id_idx on public.item_status_events (item_id);

alter table public.item_status_events enable row level security;

create policy "Owners can view own item status events"
  on public.item_status_events for select
  to authenticated
  using (
    exists (
      select 1 from public.items
      where items.id = item_status_events.item_id
        and items.owner_id = auth.uid()
    )
  );

create policy "Owners can log own item status events"
  on public.item_status_events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.items
      where items.id = item_status_events.item_id
        and items.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.items enable row level security;
alter table public.found_reports enable row level security;

-- Owners can fully manage only their own items. There is deliberately no
-- policy granting anon/public SELECT on this table: the public finder page
-- and the /recover lookup are served by Route Handlers using the
-- service-role key after server-side validation, never by a direct
-- PostgREST query from the browser. This keeps owner_id, emails, and every
-- other private column unreachable from the client no matter what a finder
-- sends.
create policy "Owners can view own items"
  on public.items for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "Owners can insert own items"
  on public.items for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Owners can update own items"
  on public.items for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete own items"
  on public.items for delete
  to authenticated
  using (auth.uid() = owner_id);

-- Owners can read reports for their own items. There is intentionally no
-- insert policy for anon/authenticated roles: finder reports are written
-- exclusively by the service-role client inside /api/reports after zod
-- validation, rate limiting, and a server-side item lookup by public_token.
create policy "Owners can view reports for own items"
  on public.found_reports for select
  to authenticated
  using (
    exists (
      select 1 from public.items
      where items.id = found_reports.item_id
        and items.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime: let the owner's dashboard/item page receive new reports live.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'found_reports'
  ) then
    alter publication supabase_realtime add table public.found_reports;
  end if;
exception when undefined_object then
  -- supabase_realtime publication doesn't exist in this environment (e.g. a
  -- local Postgres without the Supabase realtime extension) — safe to skip.
  null;
end $$;

-- ---------------------------------------------------------------------------
-- Storage: one public bucket for item + report photos.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('findback-media', 'findback-media', true)
on conflict (id) do nothing;

-- Owners may upload their own item photos directly from the browser, under
-- a path prefixed with their own user id: items/{auth.uid()}/...
create policy "Owners can upload item photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'findback-media'
    and (storage.foldername(name))[1] = 'items'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Owners can manage own item photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'findback-media'
    and (storage.foldername(name))[1] = 'items'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Owners can delete own item photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'findback-media'
    and (storage.foldername(name))[1] = 'items'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- No insert policy exists for the reports/ prefix: finder photo uploads go
-- through /api/reports using the service-role client, same as the report
-- row itself. The bucket is public, so anyone with a photo URL can view it
-- (photos are not considered sensitive), but only trusted server code can
-- write into it.
