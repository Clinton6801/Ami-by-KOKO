/**
 * POST /api/super-admin/broadcast
 * Sends email broadcast to users based on filter.
 * Stores history in broadcast_history table.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getSuperAdminEmail } from '@/lib/super-admin/access'

export async function POST(request: NextRequest) {
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
    const { subject, body, recipientFilter } = await request.json()

    if (!subject?.trim() || !body?.trim() || !recipientFilter) {
      return NextResponse.json(
        { error: 'subject, body, and recipientFilter are required' },
        { status: 400 }
      )
    }

    // Fetch recipient emails based on filter
    let recipientEmails: string[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: authUsers } = await (adminClient as any).auth.admin.listUsers()

    if (recipientFilter === 'all') {
      recipientEmails = authUsers?.users?.map((u: { email: string }) => u.email) ?? []
    } else if (recipientFilter === 'school_admin') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: admins } = await (adminClient as any)
        .from('profiles')
        .select('id')
        .eq('role', 'school_admin')

      const adminIds = admins?.map((a: { id: string }) => a.id) ?? []
      recipientEmails =
        authUsers?.users
          ?.filter((u: { id: string; email: string }) => adminIds.includes(u.id))
          .map((u: { email: string }) => u.email) ?? []
    } else if (recipientFilter === 'paid' || recipientFilter === 'free') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: subscriptions } = await (adminClient as any)
        .from('subscriptions')
        .select('profile_id, active')

      const activeSubIds = new Set(
        subscriptions
          ?.filter((s: { active: boolean }) => s.active)
          .map((s: { profile_id: string }) => s.profile_id)
      )

      if (recipientFilter === 'paid') {
        recipientEmails =
          authUsers?.users
            ?.filter((u: { id: string; email: string }) => activeSubIds.has(u.id))
            .map((u: { email: string }) => u.email) ?? []
      } else {
        recipientEmails =
          authUsers?.users
            ?.filter((u: { id: string; email: string }) => !activeSubIds.has(u.id))
            .map((u: { email: string }) => u.email) ?? []
      }
    } else if (recipientFilter === 'new_this_week') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newProfiles } = await (adminClient as any)
        .from('profiles')
        .select('id')
        .gte('created_at', sevenDaysAgo.toISOString())

      const newIds = newProfiles?.map((p: { id: string }) => p.id) ?? []
      recipientEmails =
        authUsers?.users
          ?.filter((u: { id: string; email: string }) => newIds.includes(u.id))
          .map((u: { email: string }) => u.email) ?? []
    }

    // Filter out super admin's own email
    recipientEmails = recipientEmails.filter((email) => email !== getSuperAdminEmail())

    if (recipientEmails.length === 0) {
      return NextResponse.json({
        ok: true,
        sent: 0,
        message: 'No recipients matched the filter',
      })
    }

    // Initialize Resend
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send emails
    let successCount = 0
    for (const email of recipientEmails) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (resend as any).emails.send({
          from: 'Àmì by Kòkò <noreply@resend.dev>',
          to: email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #F59E0B; padding: 20px; text-align: center;">
                <h1 style="color: #1C1917; margin: 0;">🦜 Àmì by Kòkò</h1>
              </div>
              <div style="padding: 30px; background: #FEFCE8;">
                ${body.replace(/\n/g, '<br />')}
              </div>
              <div style="padding: 15px; text-align: center; color: #78716C; font-size: 12px;">
                ami-by-koko.vercel.app
              </div>
            </div>
          `,
        })
        successCount++
      } catch (err) {
        console.error(`[broadcast] Failed to send to ${email}:`, err)
      }
    }

    // Store in broadcast_history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from('broadcast_history')
      .insert({
        subject,
        body,
        recipient_filter: recipientFilter,
        recipient_count: successCount,
        sent_by: user.email,
      })

    return NextResponse.json({
      ok: true,
      sent: successCount,
      total: recipientEmails.length,
    })
  } catch (err) {
    console.error('[super-admin/broadcast]', err)
    return NextResponse.json({ error: 'Failed to send broadcast' }, { status: 500 })
  }
}
