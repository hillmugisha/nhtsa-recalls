'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UserInfo() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setEmail(d.email))
  }, [])

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (!email) return null

  return (
    <div className="border-t border-white/10 pt-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-semibold uppercase">
            {email[0]}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">{email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="w-full py-2 rounded-md text-xs font-medium text-gray-400 border border-white/10 hover:border-white/30 hover:text-white transition-colors text-left px-3"
      >
        Sign out
      </button>
    </div>
  )
}
