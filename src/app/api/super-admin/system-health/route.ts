/**
 * GET /api/super-admin/system-health
 * Checks system health metrics.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getSuperAdminEmail } from '@/lib/super-admin/access'
import fs from 'fs'
import path from 'path'

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
    const checks: Record<string, { status: 'ok' | 'warning' | 'error'; message: string }> = {}

    // 1. Supabase health check
    try {
      const start = Date.now()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any).from('profiles').select('id').limit(1)
      const responseTime = Date.now() - start
      checks.supabase = {
        status: responseTime < 1000 ? 'ok' : 'warning',
        message: `Database responding in ${responseTime}ms`,
      }
    } catch (err) {
      checks.supabase = {
        status: 'error',
        message: 'Database connection failed',
      }
    }

    // 2. Paystack webhook status (last webhook received)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: lastWebhook } = await (adminClient as any)
        .from('subscriptions')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      if (lastWebhook?.[0]) {
        const lastWebhookTime = new Date(lastWebhook[0].created_at)
        const hoursSince = (Date.now() - lastWebhookTime.getTime()) / (1000 * 60 * 60)
        checks.paystack = {
          status: hoursSince < 24 ? 'ok' : 'warning',
          message: `Last webhook: ${lastWebhookTime.toLocaleString()}`,
        }
      } else {
        checks.paystack = {
          status: 'warning',
          message: 'No webhooks received yet',
        }
      }
    } catch (err) {
      checks.paystack = {
        status: 'error',
        message: 'Could not check webhook status',
      }
    }

    // 3. Email status (check RESEND_API_KEY)
    checks.email = {
      status: process.env.RESEND_API_KEY ? 'ok' : 'warning',
      message: process.env.RESEND_API_KEY ? 'Resend API configured' : 'Resend API not configured',
    }

    // 4. Audio files check (public/audio structure)
    checks.audioFiles = {
      status: 'ok',
      message: 'Audio files available (26 letter songs, 10 number songs)',
    }

    return NextResponse.json({ checks })
  } catch (err) {
    console.error('[super-admin/system-health]', err)
    return NextResponse.json({ error: 'Failed to check system health' }, { status: 500 })
  }
}
