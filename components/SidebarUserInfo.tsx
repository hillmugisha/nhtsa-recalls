'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SidebarUserInfo() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setEmail(d.email))
  }, [])

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (!email) return null

  return (
    <div className="border-t border-white/10 pt-4 mt-4 shrink-0">
      <p className="text-white/50 text-xs truncate mb-3 px-1">{email}</p>
      <button
        onClick={handleSignOut}
        className="w-full px-3 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
