import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, PKCE_COOKIE } from '@/lib/auth'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

/**
 * GET: Server-side OAuth code exchange. Google redirects the user to
 * /auth/callback?code=...&state=...; the callback page redirects here.
 * We read code_verifier from the httpOnly PKCE cookie, exchange the code
 * with Google on the server, set the session cookie, and redirect to /assignment-3.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.redirect(new URL('/assignment-3?error=missing_params', request.url))
    }

    const pkceCookie = request.cookies.get(PKCE_COOKIE)?.value
    if (!pkceCookie) {
      return NextResponse.redirect(new URL('/assignment-3?error=session_expired', request.url))
    }

    let code_verifier: string
    let storedState: string
    let redirect_uri: string
    let redirect_to: string
    try {
      const payload = JSON.parse(
        Buffer.from(pkceCookie, 'base64url').toString('utf-8')
      ) as { code_verifier: string; state: string; redirect_uri: string; redirect_to?: string }
      code_verifier = payload.code_verifier
      storedState = payload.state
      redirect_uri = payload.redirect_uri
      redirect_to = payload.redirect_to || '/assignment-3'
    } catch {
      return NextResponse.redirect(new URL('/assignment-3?error=invalid_cookie', request.url))
    }

    if (state !== storedState) {
      return NextResponse.redirect(new URL('/assignment-3?error=invalid_state', request.url))
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      return NextResponse.redirect(new URL('/assignment-3?error=config', request.url))
    }

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        code,
        code_verifier,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      return NextResponse.redirect(
        new URL(`/assignment-3?error=exchange_failed`, request.url)
      )
    }

    const redirectUrl = new URL('/assignment-3', request.url)
    const res = NextResponse.redirect(redirectUrl)
    res.cookies.set(SESSION_COOKIE, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    res.cookies.set(PKCE_COOKIE, '', { path: '/', maxAge: 0 })
    return res
  } catch (e) {
    return NextResponse.redirect(new URL('/assignment-3?error=server', request.url))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, code_verifier, redirect_uri } = body as {
      code?: string
      code_verifier?: string
      redirect_uri?: string
    }

    if (!code || !code_verifier || !redirect_uri) {
      return NextResponse.json(
        { error: 'Missing code, code_verifier, or redirect_uri' },
        { status: 400 }
      )
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured' },
        { status: 500 }
      )
    }

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        code,
        code_verifier: code_verifier,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      return NextResponse.json(
        { error: 'Token exchange failed', details: err },
        { status: 400 }
      )
    }

    const tokens = await tokenRes.json()

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
