// ─── Core Enums ──────────────────────────────────────────────────────────────

export type UserRole = 'parent' | 'school_admin'

export type Language = 'english' | 'yoruba' | 'igbo' | 'hausa'

export type AppMode = 'phonics' | 'dj_booth' | 'story'

export type KokoMood = 'happy' | 'sad' | 'excited' | 'neutral' | 'singing'

export type AmiMood = 'happy' | 'curious' | 'celebrating' | 'neutral'

// ─── MVP language constants ───────────────────────────────────────────────────

export const MVP_LANGUAGES: Language[] = ['english', 'yoruba']
export const ALL_LANGUAGES: Language[] = ['english', 'yoruba', 'igbo', 'hausa']

// ─── Database Row Types (mirrors Supabase schema) ────────────────────────────

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  school_id?: string
  created_at: string
}

export interface School {
  id: string
  name: string
  logo_url?: string
  subscription_active: boolean
  created_at: string
}

export interface Child {
  id: string
  parent_id?: string
  school_id?: string
  name: string
  age?: number
  avatar_url?: string
  created_at: string
}

/** Renamed from Progress for clarity — tracks per-letter phonics progress */
export interface LetterProgress {
  id: string
  child_id: string
  language: Language
  letter: string
  heard_count: number
  traced_count: number
  mastered: boolean
  last_activity: string
}

export interface Session {
  id: string
  child_id: string
  started_at: string
  ended_at?: string
  mode: AppMode
}

export interface Subscription {
  id: string
  profile_id: string
  plan: 'individual' | 'school'
  paystack_reference?: string
  active: boolean
  expires_at?: string
}

// ─── Phonics Content Types ────────────────────────────────────────────────────

/** Config for a single language — letters, labels, free/paid */
export interface LanguageConfig {
  code: Language
  label: string
  nativeLabel: string
  free: boolean
  letters: LetterConfig[]
}

/** Config for a single letter within a language */
export interface LetterConfig {
  letter: string
  phonetic: string          // how Kòkò says it
  englishWord: string       // "Apple"
  localWord: string         // "Àgbàdo"
  localWordMeaning: string  // "corn"
  audioClipPath?: string    // path in Supabase Storage or /public/audio/
  imageUrl?: string         // illustration URL (OpenMoji CDN)
}

// ─── Story Mode Types ─────────────────────────────────────────────────────────

export interface VoiceShard {
  letter: string
  collected: boolean
}

export interface StoryProgress {
  shardsCollected: number
  totalShards: number // 10 for MVP
  completed: boolean
}

// ─── Curriculum Types (Section 9 of build instructions) ──────────────────────

export type ClassLevel = 'sprout_1' | 'sprout_2' | 'sprout_3' | 'stepping_stone'

export type Term = 1 | 2 | 3

export type Subject = 'literacy' | 'numeracy' | 'world'

export type ActivityType = 'tracing' | 'listening' | 'matching' | 'counting'

/** Human-readable labels for class levels */
export const CLASS_LABELS: Record<ClassLevel, string> = {
  sprout_1:      'Sprout 1',
  sprout_2:      'Sprout 2',
  sprout_3:      'Sprout 3',
  stepping_stone: 'Stepping Stone',
}

/** Age ranges per class */
export const CLASS_AGES: Record<ClassLevel, string> = {
  sprout_1:      '1–3 years',
  sprout_2:      '3–4 years',
  sprout_3:      '4–5 years',
  stepping_stone: '5–6 years',
}

/** Which classes are active (content available) vs coming soon */
export const ACTIVE_CLASSES: ClassLevel[] = ['sprout_1']

/** Subject display names per the UI rules */
export const SUBJECT_LABELS: Record<Subject, string> = {
  literacy: 'Literacy & Language',
  numeracy: 'Numbers & Shapes',
  world:    'My World',
}

export const SUBJECT_EMOJIS: Record<Subject, string> = {
  literacy: '🔤',
  numeracy: '🔢',
  world:    '🌍',
}

/** Extended Child type with new curriculum fields */
export interface ChildWithClass extends Child {
  class?: ClassLevel
  term?: Term
  student_pin?: string
}

export interface Assignment {
  id: string
  school_id: string
  class: ClassLevel
  subject: Subject
  term: Term
  title: string
  description?: string
  activity_type: ActivityType
  content_keys: string[]   // e.g. ['s', 'a', 't'] or ['1', '2', '3']
  due_date?: string
  created_by: string
  created_at: string
}

export interface AssignmentProgress {
  id: string
  assignment_id: string
  child_id: string
  completed: boolean
  completed_at?: string
}

export interface StudentLoginSession {
  school_code: string
  child_id: string
  school_id: string
  class: ClassLevel
  term: Term
}

/** Sprout 1 Term 1 literacy sound set (Jolly Phonics order, no branding) */
export const SPROUT1_TERM1_SOUNDS = ['s', 'a', 't', 'i', 'p', 'n'] as const

/** Sprout 1 Term 2 sound sets */
export const SPROUT1_TERM2_SOUNDS = ['c', 'k', 'e', 'h', 'r', 'm', 'd', 'g', 'o', 'u', 'l', 'f', 'b'] as const

/** Sprout 1 Term 3 sound sets */
export const SPROUT1_TERM3_SOUNDS = ['ai', 'j', 'oa', 'ie', 'ee', 'or', 'z', 'w', 'ng', 'v'] as const

/** Sprout 1 numeracy content per term */
export const SPROUT1_NUMERACY: Record<Term, string[]> = {
  1: ['1', '2', '3'],
  2: ['4', '5', '6', '7'],
  3: ['8', '9', '10'],
}

/** Sprout 1 World Knowledge content per term */
export const SPROUT1_WORLD: Record<Term, string[]> = {
  1: ['head', 'eyes', 'nose', 'mouth', 'hands', 'feet'],
  2: ['dog', 'cat', 'cow', 'goat', 'chicken', 'parrot', 'mango', 'orange', 'banana'],
  3: ['cup', 'book', 'bag', 'shoe', 'ball', 'spoon', 'sun', 'rain', 'cloud'],
}

// ─── Certificate Types (Phase 2) ───────────────────────────────────────────────

export type CertificateType =
  | 'first_steps'
  | 'letter_master'
  | 'number_star'
  | 'world_explorer'
  | 'story_hero'
  | 'assignment_champion'
  | 'weekly_streak'

export interface Certificate {
  id: string
  child_id: string
  type: CertificateType
  earned_at: string
}

export interface CertificateConfig {
  type: CertificateType
  title: string
  achievement: string
  subject?: string
}

export const CERTIFICATE_CONFIGS: Record<CertificateType, CertificateConfig> = {
  first_steps: {
    type: 'first_steps',
    title: 'First Steps',
    achievement: 'completed their first 6 letters!',
    subject: 'English Phonics',
  },
  letter_master: {
    type: 'letter_master',
    title: 'Letter Master',
    achievement: 'mastered all 26 letters with Kòkò!',
    subject: 'English Phonics',
  },
  number_star: {
    type: 'number_star',
    title: 'Number Star',
    achievement: 'counted to 10 with Kòkò!',
    subject: 'Numbers',
  },
  world_explorer: {
    type: 'world_explorer',
    title: 'World Explorer',
    achievement: 'explored My World with Àmì!',
    subject: 'My World',
  },
  story_hero: {
    type: 'story_hero',
    title: 'Story Hero',
    achievement: 'restored Kòkò\'s voice!',
    subject: 'Story Mode',
  },
  assignment_champion: {
    type: 'assignment_champion',
    title: 'Assignment Champion',
    achievement: 'completed 5 assignments!',
    subject: 'Assignments',
  },
  weekly_streak: {
    type: 'weekly_streak',
    title: 'Weekly Streak',
    achievement: 'learned with Kòkò 7 days in a row!',
    subject: 'Learning Streak',
  },
}
