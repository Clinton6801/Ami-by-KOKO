/**
 * GET /api/super-admin/content
 * Fetches content statistics (letter mastery, song plays).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getSuperAdminEmail } from '@/lib/super-admin/access'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()

  // Verify super admin
  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user }, error } = await anonClient.auth.getUser()
  if (error || !user || user.email !== getSuperAdminEmail()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Get mastered letters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: masterProgress } = await (adminClient as any)
      .from('progress')
      .select('letter, mastered')
      .eq('subject', 'literacy')
      .eq('mastered', true)

    const letterMasteryMap: Record<string, number> = {}
    masterProgress?.forEach((p: { letter: string; mastered: boolean }) => {
      letterMasteryMap[p.letter] = (letterMasteryMap[p.letter] ?? 0) + 1
    })

    const mostMasteredLetters = Object.entries(letterMasteryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([letter, count]) => ({ letter, count }))

    // Get hardest letters (in progress but not mastered)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inProgress } = await (adminClient as any)
      .from('progress')
      .select('letter, mastered')
      .eq('subject', 'literacy')
      .eq('mastered', false)

    const hardLettersMap: Record<string, number> = {}
    inProgress?.forEach((p: { letter: string; mastered: boolean }) => {
      hardLettersMap[p.letter] = (hardLettersMap[p.letter] ?? 0) + 1
    })

    const hardestLetters = Object.entries(hardLettersMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([letter, count]) => ({ letter, count }))

    // Get most played songs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: songs } = await (adminClient as any)
      .from('progress')
      .select('letter, heard_count')
      .eq('subject', 'songs')
      .order('heard_count', { ascending: false })
      .limit(10)

    const songStats = (songs ?? []).map((s: { letter: string; heard_count: number }) => ({
      name: `${s.letter} Song`,
      plays: s.heard_count,
    }))

    return NextResponse.json({
      mostMasteredLetters,
      hardestLetters,
      mostPlayedSongs: songStats,
    })
  } catch (err) {
    console.error('[super-admin/content]', err)
    return NextResponse.json({ error: 'Failed to fetch content stats' }, { status: 500 })
  }
}
