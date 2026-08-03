'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalUsers: number
  freeUsers: number
  paidUsers: number
  conversionRate: number
  totalSchools: number
  totalStudents: number
  totalActiveSubscriptions: number
  totalSchoolAdmins: number
  newThisWeek: number
  recentSignups: Array<{
    id: string
    full_name: string
    role: string
    plan: string
    created_at: string
  }>
}

interface StatCard {
  label: string
  value: string | number
  icon: string
  color: string
}

function StatCard({ label, value, icon, color }: StatCard) {
  return (
    <div className={`${color} p-6 rounded-lg shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )
}

export default function SuperAdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/super-admin/stats')
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">❌ {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon="👤"
          color="bg-blue-50"
        />
        <StatCard
          label="Free Users"
          value={stats.freeUsers}
          icon="📕"
          color="bg-gray-50"
        />
        <StatCard
          label="Paid Users"
          value={stats.paidUsers}
          icon="✅"
          color="bg-green-50"
        />
        <StatCard
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon="📈"
          color="bg-amber-50"
        />

        <StatCard
          label="Schools"
          value={stats.totalSchools}
          icon="🏫"
          color="bg-purple-50"
        />
        <StatCard
          label="Students"
          value={stats.totalStudents}
          icon="👶"
          color="bg-pink-50"
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.totalActiveSubscriptions}
          icon="🔄"
          color="bg-cyan-50"
        />
        <StatCard
          label="New This Week"
          value={stats.newThisWeek}
          icon="✨"
          color="bg-yellow-50"
        />
      </div>

      {/* Recent Signups Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Signups</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Plan
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSignups.map((signup) => (
                <tr key={signup.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{signup.full_name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {signup.role === 'school_admin' ? 'School Admin' : 'Parent'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        signup.plan === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {signup.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(signup.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
