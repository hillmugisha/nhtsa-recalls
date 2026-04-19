'use client'

import { useState } from 'react'
import Spinner from './Spinner'

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
            <Spinner />
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
