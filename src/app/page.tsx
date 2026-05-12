import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Root page — redirects authenticated users to /home,
 * everyone else to /auth/login.
 */
export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  } else {
    redirect('/auth/login')
  }
}
