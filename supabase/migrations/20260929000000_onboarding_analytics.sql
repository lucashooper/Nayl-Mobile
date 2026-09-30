-- Onboarding funnel analytics: one row per onboarding step reached.
-- Written by src/services/onboardingAnalytics.ts, read by admin/analytics/index.html.
-- Run once in the Supabase dashboard SQL editor (safe to re-run).

create table if not exists public.onboarding_analytics (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null,                 -- one onboarding run on one device
  user_name   text,                          -- null until the Name Input step
  step_index  integer not null,
  step_name   text not null,
  "timestamp" timestamptz not null default now(),
  completed   boolean not null default false -- true on the terminal event
);

create index if not exists onboarding_analytics_timestamp_idx
  on public.onboarding_analytics ("timestamp" desc);
create index if not exists onboarding_analytics_session_idx
  on public.onboarding_analytics (session_id);

alter table public.onboarding_analytics enable row level security;

-- The app logs before sign-in, so anon may insert. Nobody but the service
-- role (the admin panel) can read, so the public anon key can't list names.
drop policy if exists "onboarding_analytics insert" on public.onboarding_analytics;
create policy "onboarding_analytics insert"
  on public.onboarding_analytics
  for insert
  to anon, authenticated
  with check (true);

-- Supabase's default privileges grant anon/authenticated everything on new
-- public tables (TRUNCATE ignores RLS), so reset to insert only.
revoke all on public.onboarding_analytics from anon, authenticated;
grant insert on public.onboarding_analytics to anon, authenticated;
