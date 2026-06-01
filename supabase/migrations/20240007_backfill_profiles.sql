-- ============================================================
-- Àmì by Kòkò — Migration 007
-- Backfill missing profiles for old accounts + add phone_number column
-- Safe to re-run.
-- ============================================================

-- Add phone_number column if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number text;

-- Backfill missing profiles for users who don't have a profile record
-- This handles old accounts created before the trigger was added
INSERT INTO public.profiles (id, role, full_name, phone_number)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'role', 'parent'),
  COALESCE(raw_user_meta_data->>'full_name', ''),
  NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Log the backfill result
DO $$
DECLARE
  backfilled_count INT;
BEGIN
  SELECT COUNT(*) INTO backfilled_count FROM public.profiles;
  RAISE NOTICE 'Backfill complete. Total profiles: %', backfilled_count;
END $$;
