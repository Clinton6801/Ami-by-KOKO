import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not remove this
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes — redirect to login if not authenticated
  const isAppRoute =
    request.nextUrl.pathname.startsWith('/home') ||
    request.nextUrl.pathname.startsWith('/phonics') ||
    request.nextUrl.pathname.startsWith('/literacy') ||
    request.nextUrl.pathname.startsWith('/numeracy') ||
    request.nextUrl.pathname.startsWith('/world') ||
    request.nextUrl.pathname.startsWith('/assignment') ||
    request.nextUrl.pathname.startsWith('/dj-booth') ||
    request.nextUrl.pathname.startsWith('/story') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/school-setup')

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Already logged in — redirect away from auth pages (but NOT student-login)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
