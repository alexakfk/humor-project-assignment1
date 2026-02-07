import { NextRequest, NextResponse } from 'next/server'
import { PKCE_COOKIE } from '@/lib/auth'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const PKCE_MAX_AGE = 600 // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code_challenge, state, code_verifier, redirect_uri } = body as {
      code_challenge?: string
      state?: string
      code_verifier?: string
      redirect_uri?: string
    }

    if (!code_challenge || !state || !code_verifier || !redirect_uri) {
      return NextResponse.json(
        { error: 'Missing code_challenge, state, code_verifier, or redirect_uri' },
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

    const payload = JSON.stringify({ code_verifier, state, redirect_uri })
    const cookieValue = Buffer.from(payload, 'utf-8').toString('base64url')

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirect_uri,
      response_type: 'code',
      scope: 'openid email profile',
      code_challenge,
      code_challenge_method: 'S256',
      state,
    })
    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`

    const res = NextResponse.json({ authUrl })
    res.cookies.set(PKCE_COOKIE, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: PKCE_MAX_AGE,
    })
    return res
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
