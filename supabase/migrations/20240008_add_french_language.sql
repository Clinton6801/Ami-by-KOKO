-- ============================================================
-- Àmì by Kòkò — Migration 008
-- Add French language support
-- Safe to re-run.
-- ============================================================

-- Update progress table language constraint to include french
ALTER TABLE public.progress DROP CONSTRAINT IF EXISTS progress_language_check;
ALTER TABLE public.progress ADD CONSTRAINT progress_language_check
  CHECK (language IN ('english', 'yoruba', 'igbo', 'hausa', 'french'));

-- Update sessions table language constraint if it exists
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_language_check;

-- Log the update
DO $$
BEGIN
  RAISE NOTICE 'French language support added to progress table';
END $$;
