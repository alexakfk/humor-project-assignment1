import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

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
