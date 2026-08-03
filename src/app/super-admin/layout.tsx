'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/super-admin', icon: '📊' },
  { label: 'Users', href: '/super-admin/users', icon: '👥' },
  { label: 'Schools', href: '/super-admin/schools', icon: '🏫' },
  { label: 'Revenue', href: '/super-admin/revenue', icon: '💰' },
  { label: 'Broadcast', href: '/super-admin/broadcast', icon: '📢' },
  { label: 'Content', href: '/super-admin/content', icon: '📚' },
  { label: 'System', href: '/super-admin/system', icon: '⚙️' },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch('/api/super-admin/verify')
        const data = await res.json()
        if (data.authorized) {
          setAuthorized(true)
        } else {
          router.replace('/home')
        }
      } catch (err) {
        console.error('Super admin verification failed:', err)
        router.replace('/home')
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin">⏳</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 shadow-lg`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className={sidebarOpen ? '' : 'hidden'}>
            <h1 className="text-lg font-bold">🦜 Kòkò</h1>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            {sidebarOpen ? '◀️' : '▶️'}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-gray-900 font-semibold'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Àmì by Kòkò — Admin
            </h2>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={async () => {
              const { error } = await (
                await fetch('/auth/logout', { method: 'POST' })
              ).json()
              if (!error) {
                router.push('/auth/login')
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
