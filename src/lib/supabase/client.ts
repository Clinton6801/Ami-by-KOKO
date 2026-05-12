'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Re-export the typed client so all components get full type inference
// on .from(), .select(), .insert(), .update() etc.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Convenience type — use this when you need the client type explicitly
export type SupabaseClient = ReturnType<typeof createClient>
