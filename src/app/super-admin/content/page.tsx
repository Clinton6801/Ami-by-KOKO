'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface LetterStat {
  letter: string
  count: number
}

interface SongStat {
  name: string
  plays: number
}

interface ContentStats {
  mostMasteredLetters: LetterStat[]
  hardestLetters: LetterStat[]
  mostPlayedSongs: SongStat[]
}

export default function ContentStatsPage() {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContentStats() {
      try {
        const res = await fetch('/api/super-admin/content')
        if (!res.ok) throw new Error('Failed to fetch content stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContentStats()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Failed to load stats</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Statistics</h1>
        <p className="text-gray-600 mt-2">Learning progress and engagement metrics</p>
      </div>

      {/* Most Mastered Letters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🏆 Most Mastered Letters
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.mostMasteredLetters}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="letter" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10B981" name="Children Mastered" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hardest Letters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🔥 Hardest Letters (Struggling)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.hardestLetters}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="letter" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#EF4444" name="Children Still Practicing" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Most Played Songs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🎵 Most Played Songs
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.mostPlayedSongs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="plays" fill="#F59E0B" name="Times Played" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
