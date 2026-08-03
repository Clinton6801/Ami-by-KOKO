'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface User {
  id: string
  full_name: string
  role: string
  plan: string
  children: number
  lastActive: string
  created_at: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>(searchParams.get('filter') ?? 'all')
  const [search, setSearch] = useState<string>(searchParams.get('search') ?? '')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          filter,
          search,
        })
        const res = await fetch(`/api/super-admin/users?${params}`)
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data.data)
        setPagination(data.pagination)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchUsers()
  }, [filter, search, pagination.page, pagination.limit])

  const handleActivate = async (profileId: string) => {
    try {
      const res = await fetch('/api/super-admin/users/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      })
      if (res.ok) {
        // Refetch users
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeactivate = async (profileId: string) => {
    try {
      const res = await fetch('/api/super-admin/users/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">Manage all users and subscriptions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          {['all', 'free', 'paid', 'school_admin', 'this_week', 'this_month'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                setPagination((p) => ({ ...p, page: 1 }))
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        <div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination((p) => ({ ...p, page: 1 }))
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Name
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Role
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Plan
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Children
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Joined
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {user.role === 'school_admin' ? 'School Admin' : 'Parent'}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.plan === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-gray-600">{user.children}</td>
                  <td className="py-3 px-6 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 space-x-2">
                    {user.plan === 'Free' ? (
                      <button
                        onClick={() => handleActivate(user.id)}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
            }
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination((p) => ({
                ...p,
                page: Math.min(p.totalPages, p.page + 1),
              }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
