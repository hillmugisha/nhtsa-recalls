'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('recalls')
      .select('synced_at')
      .order('synced_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        const row = data as { synced_at: string } | null
        if (row?.synced_at) {
          const d = new Date(row.synced_at)
          setLastSynced(
            d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
            ' at ' +
            d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          )
        }
      })
  }, [])

  if (dismissed) return null

  return (
    <div
      className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900"
      style={{ backgroundColor: 'var(--yellow)' }}
    >
      <span className="flex-1 text-center">
        NHTSA recall data is refreshed daily.
        {lastSynced && (
          <span className="ml-2 font-normal">Last refreshed: <span className="font-semibold">{lastSynced}</span></span>
        )}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 text-gray-700 hover:text-gray-900 font-bold text-base leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
