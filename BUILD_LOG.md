# BUILD_LOG

Development log for FindBack, built for the GDGoC Korea University BYPP hackathon.

> This file is written to be evidence of in-event development. Sections marked
> `[FILL IN]` must be completed by the team with real information — nothing in
> those sections has been fabricated.

## Session info

- **Date:** 2026-09-18 (this build session)
- **Team members:** [FILL IN]
- **AI assistance:** Implemented with Claude Code (Anthropic) acting as a pair-programming
  engineer for the full session — scaffolding, all application code, the SQL
  migration, and this documentation were AI-assisted. All output was reviewed
  and verified by running lint/type-check/tests/build against the real project
  (see "Tests performed" below), not just generated and left unchecked.

## Major implementation stages

1. **Scaffolding** — `create-next-app` with TypeScript strict, Tailwind v4, App
   Router, `src/` layout. Added `@supabase/supabase-js`, `@supabase/ssr`, `zod`,
   `qrcode.react`, `server-only`.
2. **Data model & migration** — Wrote `supabase/migrations/initial_schema.sql`
   covering `items`, `found_reports`, and an added `item_status_events` table
   (needed to support the owner-facing timeline honestly, since the spec's
   two-table schema has no place to record *when* an item was marked lost or
   returned). Enabled RLS on every table; deliberately did **not** add an
   anon/public SELECT or INSERT policy anywhere — public reads/writes go
   through server Route Handlers using the service-role key instead, after
   validation.
3. **Supabase clients** — Three separate clients by trust level:
   `lib/supabase/client.ts` (browser, anon key), `lib/supabase/server.ts`
   (Server Components/Actions, user's session cookies, RLS applies),
   `lib/supabase/admin.ts` (service-role, `server-only`-guarded, used only in
   `/api/*` and the public `/f/[publicToken]` page).
4. **Auth** — Supabase email magic-link (OTP), `/auth/callback` route handler,
   `middleware`→`proxy.ts` (Next 16 renamed the convention mid-build; migrated
   via the official codemod) protecting `/dashboard` and `/items/*`.
5. **Owner flows** — `/items/new` (Server Action `createItemAction`, retries
   on public_token/recovery_code collisions), `/dashboard`, `/items/[id]`
   (timeline + reports + status actions), `/items/[id]/tag` (QR + print CSS).
6. **Public flows** — `/f/[publicToken]` (server-rendered via admin client,
   sanitized through `toPublicItemView` so only safe fields ever reach the
   response), `/recover`, `/api/reports` (multipart form, zod validation,
   honeypot, in-memory rate limit, photo upload to Storage), `/api/recover`.
7. **Realtime** — `found_reports` added to the `supabase_realtime` publication;
   `/items/[id]` subscribes via `postgres_changes` so new reports appear
   without a manual refresh.
8. **Email notification abstraction** — `lib/notifications/email.ts` calls the
   Resend HTTP API directly (no SDK dependency) if `RESEND_API_KEY` is set;
   otherwise logs a Korean dev-mode message and no-ops. Never blocks the
   report flow (wrapped in try/catch, awaited but failure is swallowed).
9. **Status transition rules** — Added `lib/statusTransitions.ts` so
   lost/found/returned/safe changes follow an explicit allowed-transition
   graph instead of any-to-any, enforced both in the UI and the server action.
10. **Tests, lint, type-check, build** — see below.
11. **Repo relocation** — mid-session the user asked to move the project from
    `~/projects/findback` (created before the session's working directory was
    clarified) into a standalone `~/findback` with its own git repo. Files
    were copied (excluding `node_modules`/`.next`), `git init` run fresh, and
    lint/type-check/build re-verified from the new location before continuing.
12. **Karrot-style dashboard + zero-friction finder page** — Redesigned
    `/dashboard` with a profile banner (derived display name/email + total /
    lost / returned stat counts), a responsive item grid, a sticky primary
    "+ 새 물건 등록하기" CTA, and a mascot-illustrated empty state. On
    `/f/[publicToken]`: added quick-select message pills, two trust-indicator
    chips, and an **opt-in** "내 위치 공유하기" button that calls
    `navigator.geolocation.getCurrentPosition` only on tap (never
    automatically) and attaches lat/lng to the report. `found_reports.location_text`
    was relaxed from required to optional per explicit request. Renamed
    `initial_schema.sql` → `20260918000000_initial_schema.sql` and added
    `20260919000000_add_report_geolocation.sql` for the new nullable
    `latitude`/`longitude` columns, since Supabase's migration ordering is
    filename-based and the original undated filename would have sorted
    before any numerically-prefixed follow-up.

## Important decisions

- **Service-role key confined to server code, never a client-callable RPC.**
  Considered a Postgres `SECURITY DEFINER` function for public reads instead,
  but a validated Route Handler was simpler to reason about for a hackathon
  timeline and keeps all public-facing logic (rate limiting, honeypot,
  sanitization) in one typed place.
- **`item_status_events` table added beyond the spec's two named tables.**
  The spec explicitly requires an owner timeline with "Marked lost" and
  "Returned" entries; without recording those transitions, the timeline could
  only show `updated_at`, which is ambiguous once an item changes status more
  than once. This is a deliberate, minimal addition, not scope creep.
- **6-character recovery codes instead of the example's 4 (`7K2M`).** Kept the
  same excluded-ambiguous-character alphabet but lengthened it to reduce
  brute-force/guessing risk on `/recover`, which has no CAPTCHA.
- **Finder photo uploads go through `/api/reports`, not direct client
  upload.** Finders are unauthenticated, so there's no safe way to scope a
  direct-to-Storage upload to them; routing through the validated API keeps
  the storage bucket's insert policy limited to authenticated owners
  (`items/`) and the service role (`reports/`).
- **Owners cannot directly set status to `found`.** It's system-set the moment
  a finder report lands, so it was removed from the manually-selectable
  transition graph to avoid a confusing/inconsistent state.
- **GPS sharing kept strictly opt-in, tapping a tension with the product's own
  privacy pitch.** The landing page and finder page both state "위치 자동수집
  없음" / no *automatic* location access — that promise is still literally
  true (the browser's geolocation prompt only fires when the finder taps
  "내 위치 공유하기"), but this is a genuine addition to what the app collects
  and is worth the team being deliberate about in the demo narrative, not
  something to gloss over as purely cosmetic.
- **`location_text` made optional, not required.** Requested explicitly to
  reduce finder friction. Trade-off: a report can now be submitted with no
  text location and no shared GPS (only a `return_method`) — accepted as-is
  per the request, not defended against with an added cross-field rule.

## Commands used

```bash
npx create-next-app@latest findback --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
npm install @supabase/supabase-js @supabase/ssr zod qrcode.react server-only
npm install -D vitest @types/node@latest
npx @next/codemod@canary middleware-to-proxy . --force   # mid-build Next 16 rename
npm run lint
npx tsc --noEmit
npm run build
npm run test
```

## Tests performed

- `npm run lint` — clean, 0 errors (one `react-hooks/set-state-in-effect`
  error was found and fixed in `RealtimeReports.tsx` by moving the
  props-sync into render instead of an effect).
- `npm run build` — production build succeeds; all 8 required routes plus
  `/api/reports` and `/api/recover` compile and are listed in the route
  manifest (verified by reading `next build` output directly).
- `npm run test` (Vitest) — 26 unit tests, all passing, covering:
  - `generatePublicToken` / `generateRecoveryCode` (format, uniqueness across
    1000–2000 samples, ambiguous-character exclusion)
  - `normalizeRecoveryCode`
  - `itemFormSchema`, `reportFormRefined` (including the `other` return
    method requiring a custom place, honeypot rejection, privacy
    acknowledgement requirement), `recoverCodeSchema`
  - `toPublicItemView` — asserts the exact allowed field set and explicitly
    asserts `id`/`owner_id`/`public_token`/`recovery_code`/timestamps are
    `undefined` on the returned object
  - `isValidStatusTransition` / `getAllowedNextStatuses`
- Manual/browser verification of the full click-through flow: **`[FILL IN]`**
  — run `npm run dev`, follow the "데모 방법" section in `README.md`, and
  record the result here (this AI session did not have a browser or a live
  Supabase project available to click through the UI end-to-end).
- Cross-device QR scan test against a deployed URL: **`[FILL IN]`** (requires
  an actual Vercel deployment + phone camera).

## Problems encountered and solutions

- **`npm error EALLOWSCRIPTS`** on the very first `create-next-app` run,
  caused by a global `~/.npmrc` entry (`allow-scripts=@anthropic-ai/claude-code`)
  conflicting with npm 11's script-permission gating. Fixed by scaffolding
  without dependency install, then running `npm install` separately inside
  the project directory.
- **Supabase queries typed as `never`.** `SupabaseClient<Database>` requires
  the `Database["public"]` shape to structurally satisfy postgrest-js's
  `GenericSchema` (each table needs a `Relationships` array; the schema needs
  `Views`/`Functions` keys) — omitting them silently degrades every
  `.from(...)` call to `never` instead of raising a clear error. Fixed by
  completing `lib/supabase/types.ts` to the full expected shape.
- **`tsc --noEmit` failed on `LayoutProps<"/">`** even though `next build`
  succeeded. That global type is generated by Next.js into `.next/types` at
  build time; a bare `tsc` run before any `next build`/`next dev` won't see
  it. Resolution: treat `next build`'s own type-checking step as authoritative
  (documented in the README test commands) rather than a standalone `tsc`
  invocation on a clean checkout.
- **`react-hooks/set-state-in-effect` ESLint error** in `RealtimeReports.tsx`
  from syncing `initialReports` into local state inside a `useEffect`. Fixed
  by comparing-and-setting during render instead, per the React team's
  recommended pattern (avoids a redundant render pass).
- **Next.js 16 deprecated the `middleware.ts` convention mid-build**, printing
  a `Please use "proxy" instead` warning. Ran the official
  `@next/codemod middleware-to-proxy` to rename `middleware.ts` → `src/proxy.ts`
  and `middleware()` → `proxy()`; re-ran the build to confirm the warning was
  gone and behavior unchanged.
- **Session's working directory turned out to be `/Users/sujam` (home dir,
  itself an unrelated git repo full of personal dotfiles), not
  `/Users/sujam/findback`.** The project was first scaffolded at
  `/Users/sujam/projects/findback` to avoid touching the home repo, then, on
  the user's explicit request mid-session, copied into a fresh
  `/Users/sujam/findback` with its own `git init`, excluding `node_modules`
  and `.next`. The original copy was left in place (not deleted) until the
  user confirms the relocated copy is good.

## Where AI assistance was used

Every file in this repository was authored with Claude Code assistance in a
single guided session: architecture decisions, the SQL migration, RLS
policies, all TypeScript/React code, the mascot SVG, Korean copy, and this
documentation. The human role in this session was directing scope, approving
the relocation to `~/findback`, and will need to fill in the `[FILL IN]`
placeholders in this file with real demo/testing information, since an AI
session cannot fabricate genuine user feedback or manual test results.

## Demo Market feedback

`[FILL IN — record actual feedback received during the BYPP Demo Market here.
Do not remove this placeholder or replace it with invented feedback.]`

## Improvement made after feedback

`[FILL IN — describe the specific change made in response to the Demo Market
feedback above, and link the commit/PR if applicable.]`
