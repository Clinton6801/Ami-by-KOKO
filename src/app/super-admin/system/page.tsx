'use client'

import { useEffect, useState } from 'react'

interface HealthCheck {
  status: 'ok' | 'warning' | 'error'
  message: string
}

interface SystemHealth {
  checks: Record<string, HealthCheck>
}

function StatusBadge({ status }: { status: 'ok' | 'warning' | 'error' }) {
  const styles: Record<string, { bg: string; text: string; icon: string }> = {
    ok: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚠️' },
    error: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
  }

  const style = styles[status]
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
      {style.icon} {status.toUpperCase()}
    </span>
  )
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/super-admin/system-health')
        if (!res.ok) throw new Error('Failed to fetch system health')
        const data = await res.json()
        setHealth(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    // Refresh every 5 minutes
    const interval = setInterval(fetchHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!health) {
    return <div className="text-center py-8 text-red-600">Failed to load system health</div>
  }

  const checkOrder = ['supabase', 'paystack', 'email', 'audioFiles']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
        <p className="text-gray-600 mt-2">Infrastructure and service status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {checkOrder
          .filter((key) => health.checks[key])
          .map((key) => {
            const check = health.checks[key]
            const labels: Record<string, { icon: string; label: string }> = {
              supabase: { icon: '🔌', label: 'Database' },
              paystack: { icon: '💳', label: 'Paystack Webhooks' },
              email: { icon: '📧', label: 'Email Service (Resend)' },
              audioFiles: { icon: '🎵', label: 'Audio Files' },
            }

            const info = labels[key]

            return (
              <div key={key} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {info.icon} {info.label}
                  </h3>
                  <StatusBadge status={check.status} />
                </div>
                <p className="text-gray-600 text-sm">{check.message}</p>
              </div>
            )
          })}
      </div>
    </div>
  )
}
