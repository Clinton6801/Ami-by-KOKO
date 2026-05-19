-- ============================================================
-- Àmì by Kòkò — Migration 004
-- Certificates table + profiles columns for Phase 2/3/5
-- Safe to re-run (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- Certificates table
create table if not exists public.certificates (
  id         uuid        primary key default gen_random_uuid(),
  child_id   uuid        not null references public.children(id) on delete cascade,
  type       text        not null check (type in (
    'first_steps','letter_master','number_star',
    'world_explorer','story_hero','assignment_champion','weekly_streak'
  )),
  earned_at  timestamptz not null default now(),
  unique(child_id, type)
);

alter table public.certificates enable row level security;

drop policy if exists "Parents can view their children certificates" on public.certificates;
drop policy if exists "App can insert certificates" on public.certificates;

create policy "Parents can view their children certificates"
  on public.certificates for select
  using (
    exists (
      select 1 from public.children
      where children.id = certificates.child_id
      and children.parent_id = auth.uid()
    )
  );

create policy "App can insert certificates"
  on public.certificates for insert
  with check (
    exists (
      select 1 from public.children
      where children.id = certificates.child_id
      and children.parent_id = auth.uid()
    )
  );

-- Allow students to view their own certificates
drop policy if exists "Students can view own certificates" on public.certificates;
create policy "Students can view own certificates"
  on public.certificates for select
  using (
    child_id in (
      select id from public.children where auth_user_id = auth.uid()
    )
  );

-- Profiles columns for Phase 3 (WhatsApp) and Phase 5 (onboarding)
alter table public.profiles
  add column if not exists phone_number text,
  add column if not exists whatsapp_notifications boolean default true,
  add column if not exists onboarding_complete boolean default false;

-- Schools brand_color for Phase 8
alter table public.schools
  add column if not exists brand_color text default 'amber'
    check (brand_color in ('amber','blue','green','purple','crimson','teal','navy','orange'));

-- Class config table for Phase 6
create table if not exists public.class_config (
  class        text    primary key check (class in ('sprout_1','sprout_2','sprout_3','stepping_stone')),
  active       boolean default false,
  launch_date  date
);

alter table public.class_config enable row level security;

drop policy if exists "Anyone can read class config" on public.class_config;
create policy "Anyone can read class config"
  on public.class_config for select using (true);

-- Update certificates type constraint to include sound_explorer
alter table public.certificates drop constraint if exists certificates_type_check;
alter table public.certificates add constraint certificates_type_check
  check (type in (
    'first_steps','letter_master','number_star',
    'world_explorer','story_hero','assignment_champion',
    'weekly_streak','sound_explorer'
  ));
insert into public.class_config (class, active) values
  ('sprout_1',      true),
  ('sprout_2',      false),
  ('sprout_3',      false),
  ('stepping_stone',false)
on conflict (class) do nothing;
