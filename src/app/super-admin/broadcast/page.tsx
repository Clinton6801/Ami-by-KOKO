'use client'

import { useState, useEffect } from 'react'

interface BroadcastHistoryItem {
  id: string
  subject: string
  recipient_filter: string
  recipient_count: number
  sent_at: string
  sent_by: string
}

export default function BroadcastPage() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipientFilter, setRecipientFilter] = useState('all')
  const [sending, setSending] = useState(false)
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      const res = await fetch('/api/super-admin/broadcast/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in subject and message')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/super-admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          recipientFilter,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Broadcast sent to ${data.sent} recipients!`)
        setSubject('')
        setBody('')
        setRecipientFilter('all')
        fetchHistory()
      } else {
        alert('Failed to send broadcast')
      }
    } catch (err) {
      console.error(err)
      alert('Error sending broadcast')
    } finally {
      setSending(false)
    }
  }

  const filterLabels: Record<string, string> = {
    all: 'All Users',
    free: 'Free Users Only',
    paid: 'Paid Users Only',
    school_admin: 'School Admins Only',
    new_this_week: 'New Users This Week',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Broadcast</h1>
        <p className="text-gray-600 mt-2">Send mass emails to users</p>
      </div>

      {/* Composer */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          <div className="space-y-2">
            {Object.entries(filterLabels).map(([value, label]) => (
              <label key={value} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="recipientFilter"
                  value={value}
                  checked={recipientFilter === value}
                  onChange={(e) => setRecipientFilter(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Preview */}
        {body && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3">PREVIEW</p>
            <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px' }}>
              <div style={{ background: '#F59E0B', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ color: '#1C1917', margin: 0 }}>🦜 Àmì by Kòkò</h1>
              </div>
              <div style={{ padding: '30px', background: '#FEFCE8' }}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{body}</p>
              </div>
              <div style={{ padding: '15px', textAlign: 'center', color: '#78716C', fontSize: '12px' }}>
                ami-by-koko.vercel.app
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ This will send to {filterLabels[recipientFilter]}
          </p>
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {sending ? '⏳ Sending...' : '📧 Send Broadcast'}
        </button>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Send History</h2>
        {loadingHistory ? (
          <p className="text-gray-600">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-600">No broadcasts sent yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Recipients
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Sent To
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{item.sent_at}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{item.subject}</td>
                    <td className="py-3 px-4 text-gray-600">{item.recipient_count}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {filterLabels[item.recipient_filter] || item.recipient_filter}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
