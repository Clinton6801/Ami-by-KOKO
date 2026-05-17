import { redirect } from 'next/navigation'
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

  if (!user) {
    redirect('/auth/login')
  }

  // Students (role = "student" in user_metadata) don't have a profiles row.
  // They get a minimal profile object so the layout renders correctly.
  const isStudent = user.user_metadata?.role === "student";

  let profile: Profile;

  if (isStudent) {
    profile = {
      id: user.id,
      role: "parent", // render parent nav for students
      full_name: user.user_metadata?.child_id ? "Student" : "Student",
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
