-- ============================================================
-- Àmì by Kòkò — Full Reset + Schema
-- Run this in Supabase SQL Editor to start clean.
-- ============================================================


-- ============================================================
-- PART 1: TEARDOWN — drop everything from previous runs
-- ============================================================

-- Drop triggers first
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions
drop function if exists public.handle_new_user() cascade;

-- Drop tables in reverse dependency order
drop table if exists public.subscriptions cascade;
drop table if exists public.sessions     cascade;
drop table if exists public.progress     cascade;
drop table if exists public.children     cascade;
drop table if exists public.profiles     cascade;
drop table if exists public.schools      cascade;


-- ============================================================
-- PART 2: SCHEMA — create tables
-- ============================================================

-- ─── SCHOOLS ─────────────────────────────────────────────────
create table public.schools (
  id                  uuid        primary key default gen_random_uuid(),
  name                text        not null,
  logo_url            text,
  subscription_active boolean     not null default false,
  created_at          timestamptz not null default now()
);

-- ─── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  role        text        not null default 'parent' check (role in ('parent', 'school_admin')),
  full_name   text        not null default '',
  school_id   uuid        references public.schools(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── CHILDREN ────────────────────────────────────────────────
create table public.children (
  id          uuid        primary key default gen_random_uuid(),
  parent_id   uuid        references public.profiles(id) on delete cascade,
  school_id   uuid        references public.schools(id)  on delete set null,
  name        text        not null,
  age         int         check (age >= 0 and age <= 12),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ─── PROGRESS ────────────────────────────────────────────────
create table public.progress (
  id            uuid        primary key default gen_random_uuid(),
  child_id      uuid        not null references public.children(id) on delete cascade,
  language      text        not null check (language in ('english', 'yoruba', 'igbo', 'hausa')),
  letter        text        not null,
  heard_count   int         not null default 0,
  traced_count  int         not null default 0,
  mastered      boolean     not null default false,
  last_activity timestamptz not null default now(),
  unique (child_id, language, letter)
);

-- ─── SESSIONS ────────────────────────────────────────────────
create table public.sessions (
  id          uuid        primary key default gen_random_uuid(),
  child_id    uuid        not null references public.children(id) on delete cascade,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  mode        text        not null check (mode in ('phonics', 'dj_booth', 'story'))
);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────
create table public.subscriptions (
  id                 uuid        primary key default gen_random_uuid(),
  profile_id         uuid        not null references public.profiles(id) on delete cascade,
  plan               text        not null check (plan in ('individual', 'school')),
  paystack_reference text,
  active             boolean     not null default false,
  expires_at         timestamptz,
  created_at         timestamptz not null default now()
);


-- ============================================================
-- PART 3: AUTO-PROFILE TRIGGER
-- Creates a profile row automatically when a user signs up.
-- search_path = public is required for security definer functions
-- so they can see public.profiles from the auth schema context.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'parent'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();


-- ============================================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.schools       enable row level security;
alter table public.children      enable row level security;
alter table public.progress      enable row level security;
alter table public.sessions      enable row level security;
alter table public.subscriptions enable row level security;

-- PROFILES
create policy "profiles: owner full access"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- SCHOOLS: school admins can read/update their own school
create policy "schools: admin can select"
  on public.schools for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.school_id = schools.id
    )
  );

create policy "schools: admin can update"
  on public.schools for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.school_id = schools.id
      and profiles.role = 'school_admin'
    )
  );

create policy "schools: insert allowed"
  on public.schools for insert
  with check (true);

-- CHILDREN: parents manage their own; school admins view their school's
create policy "children: parent full access"
  on public.children for all
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

create policy "children: school admin can select"
  on public.children for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'school_admin'
      and profiles.school_id = children.school_id
    )
  );

-- PROGRESS: parent via child ownership; school admin read-only
create policy "progress: parent full access"
  on public.progress for all
  using (
    exists (
      select 1 from public.children
      where children.id = progress.child_id
      and children.parent_id = auth.uid()
    )
  );

create policy "progress: school admin can select"
  on public.progress for select
  using (
    exists (
      select 1 from public.children
      join public.profiles on profiles.id = auth.uid()
      where children.id = progress.child_id
      and children.school_id = profiles.school_id
      and profiles.role = 'school_admin'
    )
  );

-- SESSIONS: parent via child ownership
create policy "sessions: parent full access"
  on public.sessions for all
  using (
    exists (
      select 1 from public.children
      where children.id = sessions.child_id
      and children.parent_id = auth.uid()
    )
  );

-- SUBSCRIPTIONS: owner only
create policy "subscriptions: owner can select"
  on public.subscriptions for select
  using (profile_id = auth.uid());

create policy "subscriptions: owner can insert"
  on public.subscriptions for insert
  with check (profile_id = auth.uid());

create policy "subscriptions: owner can update"
  on public.subscriptions for update
  using (profile_id = auth.uid());
