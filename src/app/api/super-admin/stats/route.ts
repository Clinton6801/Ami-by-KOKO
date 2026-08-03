/**
 * GET /api/super-admin/stats
 * Fetches overview statistics for the super admin dashboard.
 * Uses service role to bypass RLS.
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

  // Service role client for data access
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Fetch all profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allProfiles, error: profilesErr } = await (adminClient as any)
      .from('profiles')
      .select('id, created_at', { count: 'exact' })

    if (profilesErr) throw profilesErr
    const totalUsers = allProfiles?.length ?? 0

    // Fetch subscriptions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscriptions, error: subErr } = await (adminClient as any)
      .from('subscriptions')
      .select('id, profile_id, active')

    if (subErr) throw subErr

    const activeSubIds = new Set(
      subscriptions?.filter((s: { active: boolean }) => s.active).map((s: { profile_id: string }) => s.profile_id)
    )
    const paidUsers = activeSubIds.size
    const freeUsers = totalUsers - paidUsers

    // Fetch schools
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schools } = await (adminClient as any)
      .from('schools')
      .select('id', { count: 'exact' })

    const totalSchools = schools?.length ?? 0

    // Fetch students
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: children } = await (adminClient as any)
      .from('children')
      .select('id', { count: 'exact' })

    const totalStudents = children?.length ?? 0

    // Active subscriptions (school + individual)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: activeSubscriptions } = await (adminClient as any)
      .from('subscriptions')
      .select('id', { count: 'exact' })
      .eq('active', true)

    const totalActiveSubscriptions = activeSubscriptions?.length ?? 0

    // School admins count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schoolAdmins } = await (adminClient as any)
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'school_admin')

    const totalSchoolAdmins = schoolAdmins?.length ?? 0

    // New users this week
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newUsers } = await (adminClient as any)
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', sevenDaysAgo.toISOString())

    const newThisWeek = newUsers?.length ?? 0

    // Recent signups (last 10)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recentSignups } = await (adminClient as any)
      .from('profiles')
      .select('id, full_name, created_at, role')
      .order('created_at', { ascending: false })
      .limit(10)

    const recentSignupsWithPlan = (recentSignups ?? []).map((profile: { id: string; full_name: string; role: string; created_at: string }) => ({
      ...profile,
      plan: activeSubIds.has(profile.id) ? 'Paid' : 'Free',
    }))

    return NextResponse.json({
      totalUsers,
      freeUsers,
      paidUsers,
      conversionRate: totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0,
      totalSchools,
      totalStudents,
      totalActiveSubscriptions,
      totalSchoolAdmins,
      newThisWeek,
      recentSignups: recentSignupsWithPlan,
    })
  } catch (err) {
    console.error('[super-admin/stats]', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
