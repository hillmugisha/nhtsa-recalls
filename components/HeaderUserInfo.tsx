'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeaderUserInfo() {
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
    <div className="flex items-center gap-3 border-l border-white/20 pl-3">
      <span className="text-white/70 text-sm hidden lg:block">{email}</span>
      <button
        onClick={handleSignOut}
        className="px-3 py-1.5 rounded border border-white/40 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
