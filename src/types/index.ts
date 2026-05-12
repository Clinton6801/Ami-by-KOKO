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
