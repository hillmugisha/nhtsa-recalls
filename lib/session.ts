export const COOKIE_NAME = 'nhtsa_session'
export const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET ?? 'fallback-dev-secret-change-in-prod'
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function createSession(email: string): Promise<string> {
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(email))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
  return `${btoa(email)}.${sigB64}`
}

export async function verifySession(cookie: string): Promise<string | null> {
  try {
    const [emailB64, sig] = cookie.split('.')
    if (!emailB64 || !sig) return null
    const email = atob(emailB64)
    const expected = await createSession(email)
    const [, expectedSig] = expected.split('.')
    return sig === expectedSig ? email : null
  } catch {
    return null
  }
}
