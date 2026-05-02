import { NextResponse } from 'next/server'
import { OAUTH_RETURN_PATH_COOKIE, sanitizeReturnPath } from '@/lib/auth'

const MAX_AGE_SEC = 60 * 15

/**
 * Stores the post-login path before signInWithOAuth. redirectTo must stay
 * exactly /auth/callback (no ?next=) for some Supabase projects; the callback
 * route reads this cookie to send users back to /assignment-3 vs /assignment-5.
 */
export async function POST(request: Request) {
  let path: unknown
  try {
    const body = (await request.json()) as { path?: unknown }
    path = body.path
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const safe = sanitizeReturnPath(path)
  if (!safe) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(OAUTH_RETURN_PATH_COOKIE, safe, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEC,
  })
  return res
}
