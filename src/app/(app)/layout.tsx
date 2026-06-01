import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import AppNav from '@/components/ui/AppNav'
import BottomNav from '@/components/ui/BottomNav'
import ErrorBoundaryWrapper from '@/components/ui/ErrorBoundaryWrapper'

/** Inline check — avoids importing from a module shared with client components */
function isStudentEmail(email?: string | null): boolean {
  return email?.endsWith('@amibykoko.app') ?? false
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  let profile: Profile;

  if (isStudentEmail(user.email)) {
    // ── Student account ──────────────────────────────────────────────────────
    // Fetch the child record by auth_user_id — works on any device, no localStorage.
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name, school_id')
      .eq('auth_user_id', user.id)
      .limit(1)
      .single<{ id: string; name: string; school_id: string | null }>()

    if (childError) {
      console.error('[AppLayout] Failed to fetch student child record:', childError)
      redirect('/auth/login')
    }

    profile = {
      id: user.id,
      role: 'parent',                          // treated as parent for nav/layout purposes
      full_name: child?.name ?? 'Student',
      school_id: child?.school_id ?? user.user_metadata?.school_id ?? null,
      created_at: user.created_at ?? new Date().toISOString(),
    }
  } else {
    // ── Parent or school admin ───────────────────────────────────────────────
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<Profile>()

    if (profileError || !profileData) {
      console.error('[AppLayout] Failed to fetch parent profile:', profileError)
      redirect('/auth/login')
    }

    profile = profileData
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <AppNav profile={profile} />
      <main className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <ErrorBoundaryWrapper>
          {children}
        </ErrorBoundaryWrapper>
      </main>
      <BottomNav role={profile.role} />
    </div>
  )
}
