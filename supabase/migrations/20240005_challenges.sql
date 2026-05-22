-- ============================================================
-- Àmì by Kòkò — Migration 005
-- Challenges & Leaderboard (Phase 11)
-- Safe to re-run.
-- ============================================================

create table if not exists public.challenges (
  id           uuid        primary key default gen_random_uuid(),
  school_id    uuid        references public.schools(id) on delete cascade,
  class        text,
  title        text        not null,
  description  text,
  metric       text       CONTINUE check (metric in ('letters_mastered','assignments_complete','sessions')),
  target_count int         not null,
  week_start   date        not null,
  week_end     date        not null,
  created_at   timestamptz default now()
);

create table if not exists public.challenge_progress (
  id            uuid        primary key default gen_random_uuid(),
  challenge_id  uuid        not null references public.challenges(id) on delete cascade,
  child_id      uuid        not null references public.children(id) on delete cascade,
  current_count int         default 0,
  completed     boolean     default false,
  completed_at  timestamptz,
  unique(challenge_id, child_id)
);

alter table public.challenges         enable row level security;
alter table public.challenge_progress enable row level security;

-- School admins can manage challenges for their school
drop policy if exists "School admins can manage challenges" on public.challenges;
create policy "School admins can manage challenges"
  on public.challenges for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'school_admin'
      and profiles.school_id = challenges.school_id
    )
  );

-- Students and parents can read challenges
drop policy if exists "Students can read challenges" on public.challenges;
create policy "Students can read challenges"
  on public.challenges for select
  using (true);

-- Challenge progress — parents and students can read/update their own
drop policy if exists "Parents can manage challenge progress" on public.challenge_progress;
create policy "Parents can manage challenge progress"
  on public.challenge_progress for all
  using (
    child_id in (
      select id from public.children where parent_id = auth.uid()
    )
  );

-- Students (via auth_user_id) can read their own challenge progress
drop policy if exists "Students can read own challenge progress" on public.challenge_progress;
create policy "Students can read own challenge progress"
  on public.challenge_progress for select
  using (
    child_id in (
      select id from public.children where auth_user_id = auth.uid()
    )
  );

-- School admins can read all challenge progress for their school
drop policy if exists "School admins can read challenge progress" on public.challenge_progress;
create policy "School admins can read challenge progress"
  on public.challenge_progress for select
  using (
    exists (
      select 1 from public.challenges c
      join public.profiles p on p.id = auth.uid()
      where c.id = challenge_progress.challenge_id
      and p.role = 'school_admin'
      and p.school_id = c.school_id
    )
  );
