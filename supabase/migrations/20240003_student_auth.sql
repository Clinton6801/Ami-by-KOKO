-- ============================================================
-- Àmì by Kòkò — Migration 003
-- Student Auth: add auth_user_id to children + student RLS policies
-- Safe to re-run.
-- ============================================================

-- Add auth_user_id column to children
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── RLS policies for students ────────────────────────────────────────────────

-- Students can read their own child row
DROP POLICY IF EXISTS "students: read own row" ON public.children;
CREATE POLICY "students: read own row"
  ON public.children FOR SELECT
  USING (auth_user_id = auth.uid());

-- Students can read their own progress
DROP POLICY IF EXISTS "progress: student read own" ON public.progress;
CREATE POLICY "progress: student read own"
  ON public.progress FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children WHERE auth_user_id = auth.uid()
    )
  );

-- Students can read assignments for their class/school
DROP POLICY IF EXISTS "assignments: student read own class" ON public.assignments;
CREATE POLICY "assignments: student read own class"
  ON public.assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.auth_user_id = auth.uid()
      AND children.school_id = assignments.school_id
      AND children.class = assignments.class
    )
  );

-- Students can read their own assignment_progress
DROP POLICY IF EXISTS "assignment_progress: student read own" ON public.assignment_progress;
CREATE POLICY "assignment_progress: student read own"
  ON public.assignment_progress FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children WHERE auth_user_id = auth.uid()
    )
  );

-- Students can read sessions for their own child
DROP POLICY IF EXISTS "sessions: student read own" ON public.sessions;
CREATE POLICY "sessions: student read own"
  ON public.sessions FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM public.children WHERE auth_user_id = auth.uid()
    )
  );
