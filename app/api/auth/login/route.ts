import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSession, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.toLowerCase().endsWith('@pritchards.com')) {
    return NextResponse.json({ error: 'Only @pritchards.com email addresses are allowed.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: user } = await supabase
    .from('users')
    .select('access_granted, login_count')
    .eq('email', email.toLowerCase())
    .single()

  if (!user) {
    return NextResponse.json({ error: 'No account found for this email. Contact your administrator.' }, { status: 403 })
  }

  if (!user.access_granted) {
    return NextResponse.json({ error: 'Access not granted. Contact your administrator.' }, { status: 403 })
  }

  // Update login stats
  await supabase.from('users').update({
    login_count: (user.login_count ?? 0) + 1,
    last_login:  new Date().toISOString(),
  }).eq('email', email.toLowerCase())

  const session = await createSession(email.toLowerCase())

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   COOKIE_MAX_AGE,
    path:     '/',
  })
  return response
}
