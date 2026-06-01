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
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/auth/login')
    }

    let profile: Profile;

    if (isStudentEmail(user.email)) {
      // ── Student account ──────────────────────────────────────────────────────
      // Fetch the child record by auth_user_id — works on any device, no localStorage.
      try {
        const { data: child, error: childError } = await supabase
          .from('children')
          .select('id, name, school_id')
          .eq('auth_user_id', user.id)
          .limit(1)
          .single<{ id: string; name: string; school_id: string | null }>()

        if (childError) {
          console.error('[AppLayout] Student child fetch error:', {
            code: childError.code,
            message: childError.message,
            details: childError.details,
            hint: childError.hint,
            userId: user.id,
          })
          throw new Error(`Failed to load student profile: ${childError.message}`)
        }

        profile = {
          id: user.id,
          role: 'parent',                          // treated as parent for nav/layout purposes
          full_name: child?.name ?? 'Student',
          school_id: child?.school_id ?? user.user_metadata?.school_id ?? null,
          created_at: user.created_at ?? new Date().toISOString(),
        }
      } catch (err) {
        console.error('[AppLayout] Student account error:', err)
        throw err
      }
    } else {
      // ── Parent or school admin ───────────────────────────────────────────────
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single<Profile>()

        if (profileError) {
          console.error('[AppLayout] Parent profile fetch error:', {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            userId: user.id,
          })
          
          // If profile doesn't exist (PGRST116), try to create it
          if (profileError.code === 'PGRST116') {
            console.log('[AppLayout] Profile not found, attempting to create...')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: newProfile, error: createError }: { data: Profile | null; error: any } = await (supabase as any)
              .from('profiles')
              .insert({
                id: user.id,
                role: 'parent',
                full_name: user.user_metadata?.full_name ?? '',
              })
              .select()
              .single()

            if (createError) {
              console.error('[AppLayout] Failed to create profile:', createError)
              throw new Error(`Failed to create parent profile: ${createError.message}`)
            }

            if (!newProfile) {
              throw new Error('Profile creation returned no data')
            }

            console.log('[AppLayout] Profile created successfully')
            profile = newProfile
          } else {
            throw new Error(`Failed to load parent profile: ${profileError.message}`)
          }
        } else if (!profileData) {
          console.error('[AppLayout] Parent profile not found for user:', user.id)
          throw new Error('Parent profile not found. Please sign up again.')
        } else {
          profile = profileData
        }
      } catch (err) {
        console.error('[AppLayout] Parent account error:', err)
        throw err
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
  } catch (err) {
    console.error('[AppLayout] Unhandled error in layout:', err)
    throw err
  }
}
