/**
 * POST /api/super-admin/users/activate
 * POST /api/super-admin/users/deactivate
 * Manages user subscriptions.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getSuperAdminEmail } from '@/lib/super-admin/access'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const cookieStore = await cookies()
  const { action } = await params

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
    const { profileId } = await request.json()

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }

    if (action === 'activate') {
      // Set active subscription for 1 year
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateErr } = await (adminClient as any)
        .from('subscriptions')
        .update({
          active: true,
          expires_at: expiresAt.toISOString(),
        })
        .eq('profile_id', profileId)

      if (updateErr) throw updateErr

      return NextResponse.json({ ok: true, action: 'activated' })
    } else if (action === 'deactivate') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateErr } = await (adminClient as any)
        .from('subscriptions')
        .update({ active: false })
        .eq('profile_id', profileId)

      if (updateErr) throw updateErr

      return NextResponse.json({ ok: true, action: 'deactivated' })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err) {
    console.error('[super-admin/users/action]', err)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
