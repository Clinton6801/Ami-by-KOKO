-- ============================================================
-- Àmì by Kòkò — Migration 009
-- Activate Sprout 2 and Sprout 3: add new subjects, update class_config
-- Safe to re-run (uses DROP CONSTRAINT IF EXISTS / ADD CONSTRAINT IF NOT EXISTS)
-- ============================================================

-- Update class_config to activate Sprout 2 and Sprout 3
UPDATE public.class_config SET active = true WHERE class IN ('sprout_2', 'sprout_3');

-- Add any missing class_config rows
INSERT INTO public.class_config (class, active, launch_date)
VALUES 
  ('sprout_1', true, NULL),
  ('sprout_2', true, NULL),
  ('sprout_3', true, NULL),
  ('stepping_stone', false, NULL)
ON CONFLICT DO NOTHING;

-- Update progress table subject constraint to include all new subjects
ALTER TABLE public.progress DROP CONSTRAINT IF EXISTS progress_subject_check;
ALTER TABLE public.progress ADD CONSTRAINT progress_subject_check
  CHECK (subject IN (
    'literacy', 'numeracy', 'world', 'songs',
    'science', 'zoology_botany', 'seasonal_creativity',
    'health_habits', 'social_habits', 'colours_shapes',
    'french', 'music_arts', 'practical_life', 'letter_name'
  ));

-- Update assignments table subject constraint for consistency
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_subject_check;
ALTER TABLE public.assignments ADD CONSTRAINT assignments_subject_check
  CHECK (subject IN (
    'literacy', 'numeracy', 'world', 'songs',
    'science', 'zoology_botany', 'seasonal_creativity',
    'health_habits', 'social_habits', 'colours_shapes',
    'french', 'music_arts', 'practical_life', 'letter_name'
  ));

-- Update certificates type constraint to include new milestone types
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_type_check;
ALTER TABLE public.certificates ADD CONSTRAINT certificates_type_check
  CHECK (type IN (
    'first_steps', 'letter_master', 'number_star',
    'world_explorer', 'story_hero', 'assignment_champion',
    'weekly_streak', 'sound_explorer',
    'sprout_2_complete', 'sprout_3_complete',
    'science_explorer', 'french_starter'
  ));

-- Topic progress table for tracking completion of individual topics
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id              uuid        primary key default gen_random_uuid(),
  child_id        uuid        not null references public.children(id) on delete cascade,
  topic_id        text        not null,
  subject         text        not null,
  class           text        not null,
  term            int         not null,
  completed       boolean     default false,
  completed_at    timestamptz,
  unique(child_id, topic_id)
);

ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents can manage topic progress" ON public.topic_progress;
CREATE POLICY "Parents can manage topic progress"
  ON public.topic_progress FOR ALL
  USING (
    child_id IN (
      SELECT id FROM public.children WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can manage their topic progress" ON public.topic_progress;
CREATE POLICY "Students can manage their topic progress"
  ON public.topic_progress FOR ALL
  USING (
    child_id IN (
      SELECT id FROM public.children WHERE auth_user_id = auth.uid()
    )
  );
