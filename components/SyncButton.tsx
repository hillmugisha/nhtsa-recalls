'use client'

import { useState } from 'react'

export default function SyncButton() {
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSync = async () => {
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'success') {
        setStatus('success')
        setMessage(`Synced ${data.recordsUpserted ?? 0} records`)
      } else {
        setStatus('error')
        setMessage(data.message ?? 'Sync failed')
      }
    } catch {
      setStatus('error')
      setMessage('Network error during sync')
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Data Sync</h2>
      <button
        onClick={handleSync}
        disabled={status === 'loading'}
        className="w-full py-2 rounded text-sm font-semibold text-white transition-colors disabled:opacity-60"
        style={{ backgroundColor: 'var(--navy)' }}
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Syncing...
          </span>
        ) : 'Sync Latest Data'}
      </button>
      {status === 'success' && (
        <p className="text-xs text-green-700 font-medium">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-600 font-medium">{message}</p>
      )}
    </div>
  )
}
