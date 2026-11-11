-- UW Partner Coach — initial Supabase schema.
-- Run this once in the Supabase Dashboard: SQL Editor -> New query -> paste -> Run.
-- (Project: https://qavjiqnumjgoautynbil.supabase.co)

-- 1. Profiles: one row per authenticated user (auth.users), auto-created on signup.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  experience text check (experience in ('new', 'experienced')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Module progress: tracks each user's status per training module.
create table if not exists public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id text not null,
  status text not null default 'locked' check (status in ('locked', 'unlocked', 'completed')),
  completed_at timestamptz,
  -- Steps done inside the module: 'video', 'read', 'practice'.
  steps text[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

alter table public.module_progress enable row level security;

create policy "Users manage their own module progress" on public.module_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Practice sessions: one row per voice AI (Vapi) training session.
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id text,
  started_at timestamptz not null default now(),
  duration_seconds integer,
  transcript jsonb,
  rating numeric,
  created_at timestamptz not null default now()
);

alter table public.practice_sessions enable row level security;

create policy "Users manage their own practice sessions" on public.practice_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Badges earned by a user (badge catalogue itself can stay static in the frontend).
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

alter table public.user_badges enable row level security;

create policy "Users manage their own badges" on public.user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. Admin role support: lets a flagged user read (not write) everyone's data
-- for the /admin dashboard, without weakening the per-user policies above.
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- security definer + fixed search_path so this can be called from RLS
-- policies without recursively re-checking RLS on profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

create policy "Admins can view all module progress" on public.module_progress
  for select using (public.is_admin());

create policy "Admins can view all practice sessions" on public.practice_sessions
  for select using (public.is_admin());

create policy "Admins can view all badges" on public.user_badges
  for select using (public.is_admin());

-- To grant someone admin access, run in the SQL editor:
--   update public.profiles set is_admin = true where email = 'someone@example.com';

-- Website analytics: page views recorded by src/lib/analytics.ts, read on /admin
-- through admin_traffic_summary(). Applied as migration "page_views_analytics".
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor_id text,
  session_id text,
  path text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text,
  user_id uuid references auth.users (id) on delete set null
);
-- Policies: anyone may insert (length-checked), admins may select.
