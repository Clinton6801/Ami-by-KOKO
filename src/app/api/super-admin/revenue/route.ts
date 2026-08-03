/**
 * GET /api/super-admin/revenue
 * Fetches subscription revenue data.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getSuperAdminEmail } from '@/lib/super-admin/access'

// Naira pricing
const PLANS = {
  individual: 1500,
  school: 2500,
}

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
    // Fetch all active subscriptions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscriptions } = await (adminClient as any)
      .from('subscriptions')
      .select('id, profile_id, plan, paystack_reference, active, expires_at, created_at')
      .order('created_at', { ascending: false })

    // Get profile info for subscriptions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profiles } = await (adminClient as any)
      .from('profiles')
      .select('id, full_name')

    const profilesMap: Record<string, string> = {}
    profiles?.forEach((p: { id: string; full_name: string }) => {
      profilesMap[p.id] = p.full_name
    })

    // Calculate revenue metrics
    let totalActiveSubscriptions = 0
    let monthlyRecurring = 0
    let explorers = 0
    let families = 0

    const enriched = (subscriptions ?? []).map((sub: { id: string; profile_id: string; plan: 'individual' | 'school'; paystack_reference: string | null; active: boolean; expires_at: string | null; created_at: string }) => {
      if (sub.active) {
        totalActiveSubscriptions++
        const amount = PLANS[sub.plan] ?? 0
        monthlyRecurring += amount
        if (sub.plan === 'individual') explorers++
        else families++
      }

      return {
        id: sub.id,
        userEmail: profilesMap[sub.profile_id] ?? 'Unknown',
        plan: sub.plan === 'individual' ? 'Explorer' : 'Family',
        amount: PLANS[sub.plan] ?? 0,
        status: sub.active ? 'Active' : 'Inactive',
        paystackRef: sub.paystack_reference ?? 'N/A',
        startDate: new Date(sub.created_at).toLocaleDateString(),
        expiresAt: sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'N/A',
      }
    })

    return NextResponse.json({
      data: enriched,
      summary: {
        totalActiveSubscriptions,
        monthlyRecurring,
        explorers,
        families,
        estimatedMRR: monthlyRecurring,
      },
    })
  } catch (err) {
    console.error('[super-admin/revenue]', err)
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
  }
}
