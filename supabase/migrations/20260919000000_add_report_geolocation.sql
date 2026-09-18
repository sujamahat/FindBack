-- Adds optional GPS coordinates to found_reports, for the finder page's
-- opt-in "내 위치 공유하기" button. Location is only ever attached when the
-- finder explicitly taps that button (navigator.geolocation is never called
-- automatically) — both columns stay null for reports that don't include it.

alter table public.found_reports
  add column if not exists latitude double precision check (latitude between -90 and 90);

alter table public.found_reports
  add column if not exists longitude double precision check (longitude between -180 and 180);
