/**
 * GET /api/super-admin/broadcast/history
 * Fetches broadcast send history.
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: history } = await (adminClient as any)
      .from('broadcast_history')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50)

    const formatted = (history ?? []).map((h: { id: string; subject: string; recipient_filter: string; recipient_count: number; sent_at: string; sent_by: string }) => ({
      ...h,
      sent_at: new Date(h.sent_at).toLocaleString(),
    }))

    return NextResponse.json({ data: formatted })
  } catch (err) {
    console.error('[super-admin/broadcast/history]', err)
    return NextResponse.json({ error: 'Failed to fetch broadcast history' }, { status: 500 })
  }
}
