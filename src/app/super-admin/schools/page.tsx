'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface School {
  id: string
  name: string
  school_code: string | null
  subscription_active: boolean
  adminEmail: string
  pupils: number
  plan: string
  created_at: string
}

export default function SchoolsPage() {
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSchools() {
      try {
        const res = await fetch('/api/super-admin/schools')
        if (!res.ok) throw new Error('Failed to fetch schools')
        const data = await res.json()
        setSchools(data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
        <p className="text-gray-600 mt-2">Manage school subscriptions</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                School Name
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Code
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Admin
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Pupils
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-700">
                Plan
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
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No schools found
                </td>
              </tr>
            ) : (
              schools.map((school) => (
                <tr key={school.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 font-medium text-gray-900">
                    {school.name}
                  </td>
                  <td className="py-3 px-6 text-gray-600">{school.school_code}</td>
                  <td className="py-3 px-6 text-gray-600 truncate">
                    {school.adminEmail}
                  </td>
                  <td className="py-3 px-6 text-gray-600">{school.pupils}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        school.subscription_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {school.plan}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
