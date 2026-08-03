'use client'

import { useEffect, useState } from 'react'

interface Subscription {
  id: string
  userEmail: string
  plan: string
  amount: number
  status: string
  paystackRef: string
  startDate: string
  expiresAt: string
}

interface Summary {
  totalActiveSubscriptions: number
  monthlyRecurring: number
  explorers: number
  families: number
  estimatedMRR: number
}

export default function RevenuePage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await fetch('/api/super-admin/revenue')
        if (!res.ok) throw new Error('Failed to fetch revenue data')
        const data = await res.json()
        setSubscriptions(data.data)
        setSummary(data.summary)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Revenue</h1>
        <p className="text-gray-600 mt-2">Subscription and payment tracking</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Active Subscriptions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {summary.totalActiveSubscriptions}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Explorer Plans</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{summary.explorers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Family Plans</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{summary.families}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Est. Monthly MRR</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              ₦{summary.estimatedMRR.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                User
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Plan
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Amount
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Start Date
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Expires
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Paystack Ref
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No subscriptions found
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 text-gray-900 truncate">{sub.userEmail}</td>
                  <td className="py-3 px-6">{sub.plan}</td>
                  <td className="py-3 px-6 font-medium text-gray-900">
                    ₦{sub.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        sub.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-gray-600">{sub.startDate}</td>
                  <td className="py-3 px-6 text-gray-600">{sub.expiresAt}</td>
                  <td className="py-3 px-6 text-xs text-gray-600">{sub.paystackRef}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
