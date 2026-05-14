import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import AppNav from '@/components/ui/AppNav'
import BottomNav from '@/components/ui/BottomNav'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <AppNav profile={profile} />
      <main className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
