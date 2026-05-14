-- ============================================================
-- Àmì by Kòkò — Migration 002: Curriculum Schema
-- Run AFTER 20240001_initial_schema.sql
-- ============================================================

-- Add school_code to schools (auto-generated unique code)
alter table public.schools
  add column if not exists school_code text unique;

-- Generate codes for existing schools that don't have one
update public.schools
set school_code = 'AMIK-' || lpad(floor(random() * 9999 + 1)::text, 4, '0')
where school_code is null;

-- Function to auto-generate school code on insert
create or replace function public.generate_school_code()
returns trigger
language plpgsql
as $$
declare
  new_code text;
  attempts int := 0;
begin
  loop
    new_code := 'AMIK-' || lpad(floor(random() * 9999 + 1)::text, 4, '0');
    -- Check uniqueness
    if not exists (select 1 from public.schools where school_code = new_code) then
      new.school_code := new_code;
      return new;
    end if;
    attempts := attempts + 1;
    if attempts > 100 then
      -- Fallback: use part of the UUID
      new.school_code := 'AMIK-' || upper(substring(new.id::text, 1, 4));
      return new;
    end if;
  end loop;
end;
$$;

drop trigger if exists on_school_created on public.schools;
create trigger on_school_created
  before insert on public.schools
  for each row
  when (new.school_code is null)
  execute procedure public.generate_school_code();

-- Add curriculum columns to children
alter table public.children
  add column if not exists class text check (class in ('sprout_1','sprout_2','sprout_3','stepping_stone')),
  add column if not exists term int check (term in (1,2,3)) default 1,
  add column if not exists student_pin text;

-- Add curriculum columns to progress
alter table public.progress
  add column if not exists subject text check (subject in ('literacy','numeracy','world')) default 'literacy',
  add column if not exists class text check (class in ('sprout_1','sprout_2','sprout_3','stepping_stone')),
  add column if not exists term int check (term in (1,2,3)) default 1;

-- Assignments table
create table if not exists public.assignments (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  class         text not null check (class in ('sprout_1','sprout_2','sprout_3','stepping_stone')),
  subject       text not null check (subject in ('literacy','numeracy','world')),
  term          int  not null check (term in (1,2,3)),
  title         text not null,
  description   text,
  activity_type text not null check (activity_type in ('tracing','listening','matching','counting')),
  content_keys  text[] not null default '{}',
  due_date      date,
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz not null default now()
);

alter table public.assignments enable row level security;

-- Assignment progress table
create table if not exists public.assignment_progress (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  child_id      uuid not null references public.children(id) on delete cascade,
  completed     boolean not null default false,
  completed_at  timestamptz,
  unique(assignment_id, child_id)
);

alter table public.assignment_progress enable row level security;

-- RLS: assignments
create policy "School admins can manage assignments"
  on public.assignments for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'school_admin'
      and profiles.school_id = assignments.school_id
    )
  );

create policy "Children can view their class assignments"
  on public.assignments for select
  using (
    exists (
      select 1 from public.children
      where children.school_id = assignments.school_id
      and children.class = assignments.class
    )
  );

-- RLS: assignment_progress
create policy "School admins can view assignment progress"
  on public.assignment_progress for select
  using (
    exists (
      select 1 from public.assignments
      join public.profiles on profiles.id = auth.uid()
      where assignments.id = assignment_progress.assignment_id
      and profiles.role = 'school_admin'
      and profiles.school_id = assignments.school_id
    )
  );

create policy "Children can update their own assignment progress"
  on public.assignment_progress for all
  using (
    child_id in (
      select id from public.children where parent_id = auth.uid()
    )
  );
