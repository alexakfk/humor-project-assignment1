import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SESSION_COOKIE } from '@/lib/auth'

/**
 * Supabase OAuth callback. Supabase redirects here after Google sign-in
 * with ?code=... in the URL. We exchange the code for a session and
 * set our app's session cookie.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/assignment-3'

  if (!code) {
    return NextResponse.redirect(new URL(`/assignment-3?error=missing_params`, request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/assignment-3?error=auth_failed`, request.url))
  }

  const redirectUrl = new URL(next.startsWith('/') ? next : '/assignment-3', request.url)
  const res = NextResponse.redirect(redirectUrl)

  // Set our app's session cookie so assignment-3's auth check passes
  res.cookies.set(SESSION_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
