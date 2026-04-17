import { NextRequest, NextResponse } from 'next/server'
import { verifySession, COOKIE_NAME } from '@/lib/session'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (!cookie) return NextResponse.json({ email: null })
  const email = await verifySession(cookie)
  return NextResponse.json({ email })
}
