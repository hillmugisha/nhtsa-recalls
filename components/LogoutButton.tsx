'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-block px-4 py-2 rounded border border-white/50 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
    >
      Logout
    </button>
  )
}
