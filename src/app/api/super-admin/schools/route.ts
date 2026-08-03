/**
 * GET /api/super-admin/schools
 * Fetches all schools with subscription and student counts.
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
    // Fetch all schools
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schools } = await (adminClient as any)
      .from('schools')
      .select('id, name, school_code, subscription_active, created_at')
      .order('created_at', { ascending: false })

    // Fetch all school admins
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: admins } = await (adminClient as any)
      .from('profiles')
      .select('id, full_name, school_id')
      .eq('role', 'school_admin')

    const adminsBySchool: Record<string, { id: string; full_name: string }> = {}
    admins?.forEach((admin: { id: string; full_name: string; school_id: string | null }) => {
      if (admin.school_id) {
        adminsBySchool[admin.school_id] = { id: admin.id, full_name: admin.full_name }
      }
    })

    // Fetch student counts per school
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: children } = await (adminClient as any)
      .from('children')
      .select('school_id')

    const studentsBySchool: Record<string, number> = {}
    children?.forEach((child: { school_id: string | null }) => {
      if (child.school_id) {
        studentsBySchool[child.school_id] = (studentsBySchool[child.school_id] ?? 0) + 1
      }
    })

    // Enrich schools
    const enriched = (schools ?? []).map((school: { id: string; name: string; school_code: string | null; subscription_active: boolean; created_at: string }) => ({
      ...school,
      adminEmail: adminsBySchool[school.id]?.full_name ?? 'N/A',
      pupils: studentsBySchool[school.id] ?? 0,
      plan: school.subscription_active ? 'Active' : 'Inactive',
    }))

    return NextResponse.json({ data: enriched })
  } catch (err) {
    console.error('[super-admin/schools]', err)
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 })
  }
}
