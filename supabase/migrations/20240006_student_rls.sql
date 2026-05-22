-- Migration: allow students to query their own child record via auth_user_id
-- Run this in Supabase SQL editor before deploying the student auth fix.

-- Students can read their own child record (matched by auth_user_id = auth.uid())
create policy "Students can view their own child record"
  on children for select
  using (auth_user_id = auth.uid());

-- Students can update their own child record (e.g. progress, session data)
-- Scope is intentionally narrow — only the row they own.
create policy "Students can update their own child record"
  on children for update
  using (auth_user_id = auth.uid());
