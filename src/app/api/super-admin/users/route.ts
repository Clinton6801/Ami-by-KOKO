/**
 * GET /api/super-admin/users
 * Fetches paginated user list with filters and search.
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

  // Service role client
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const filter = searchParams.get('filter') ?? 'all'
    const search = searchParams.get('search') ?? ''

    const offset = (page - 1) * limit

    // Get subscriptions for filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscriptions } = await (adminClient as any)
      .from('subscriptions')
      .select('profile_id, active')

    const activeSubIds = new Set(
      subscriptions?.filter((s: { active: boolean }) => s.active).map((s: { profile_id: string }) => s.profile_id)
    )

    // Build query
    let query = (adminClient as any)
      .from('profiles')
      .select('id, full_name, created_at, role, school_id', { count: 'exact' })

    // Apply role filter
    if (filter === 'school_admin') {
      query = query.eq('role', 'school_admin')
    }

    // Apply search
    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,id.ilike.%${search}%`)
    }

    // Apply date filter
    if (filter === 'this_week') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      query = query.gte('created_at', sevenDaysAgo.toISOString())
    } else if (filter === 'this_month') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query = query.gte('created_at', thirtyDaysAgo.toISOString())
    }

    const { data: profiles, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Get children count per user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: childrenData } = await (adminClient as any)
      .from('children')
      .select('parent_id')

    const childrenByParent: Record<string, number> = {}
    childrenData?.forEach((child: { parent_id: string | null }) => {
      if (child.parent_id) {
        childrenByParent[child.parent_id] = (childrenByParent[child.parent_id] ?? 0) + 1
      }
    })

    // Enrich profiles with subscription and children count
    const enriched = (profiles ?? []).map((profile: { id: string; full_name: string; created_at: string; role: string; school_id: string | null }) => ({
      ...profile,
      plan: activeSubIds.has(profile.id) ? 'Paid' : 'Free',
      children: childrenByParent[profile.id] ?? 0,
      lastActive: profile.created_at, // TODO: track actual last activity
    }))

    return NextResponse.json({
      data: enriched,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (err) {
    console.error('[super-admin/users]', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
