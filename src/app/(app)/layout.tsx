import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import AppNav from '@/components/ui/AppNav'
import BottomNav from '@/components/ui/BottomNav'
import ErrorBoundaryWrapper from '@/components/ui/ErrorBoundaryWrapper'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile;

  if (!user) {
    // Check for student PIN fallback session (cookie-based, no Supabase auth)
    const cookieStore = await cookies()
    const studentSession = cookieStore.get("student_session")

    if (studentSession?.value) {
      // Student logged in via PIN fallback — build a minimal profile
      profile = {
        id: studentSession.value,
        role: "parent",
        full_name: "Student",
        created_at: new Date().toISOString(),
      };
    } else {
      redirect('/auth/login')
    }
  } else {
    // Supabase auth session exists
    const isStudent = user.user_metadata?.role === "student";

    if (isStudent) {
      profile = {
        id: user.id,
        role: "parent",
        full_name: "Student",
        school_id: user.user_metadata?.school_id ?? null,
        created_at: user.created_at ?? new Date().toISOString(),
      };
    } else {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profile>()

      if (!profileData) {
        redirect('/auth/login')
      }

      profile = profileData;
    }
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
