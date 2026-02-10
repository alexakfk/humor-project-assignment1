import { NextRequest, NextResponse } from 'next/server'
import { PKCE_COOKIE } from '@/lib/auth'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const PKCE_MAX_AGE = 600 // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code_challenge, state, code_verifier, redirect_to } = body as {
      code_challenge?: string
      state?: string
      code_verifier?: string
      redirect_to: "https://www.thehumorproject.org/auth/callback&"
    }

    if (!code_challenge || !state || !code_verifier || !redirect_to) {
      return NextResponse.json(
        { error: 'Missing code_challenge, state, code_verifier, or redirect_to' },
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SUPABASE_URL not configured' },
        { status: 500 }
      )
    }

    // redirect_uri points to Supabase's auth callback (where Google redirects)
    const redirect_uri = `https://secure.almostcrackd.ai/auth/v1/callback`
    // redirect_to tells Supabase where to send the user after auth (back to our app)

    const payload = JSON.stringify({ code_verifier, state, redirect_uri, redirect_to })
    const cookieValue = Buffer.from(payload, 'utf-8').toString('base64url')

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri, // Supabase callback
      redirect_to, // Where Supabase sends user after auth
      response_type: 'code',
      scope: 'email profile',
      code_challenge,
      code_challenge_method: 'S256',
      state,
    })
    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`

    const res = NextResponse.json({
      authUrl,
      redirect_uri_used: redirect_uri, // Supabase callback (what Google sees)
      redirect_to_used: redirect_to, // App callback (where Supabase sends user)
    })
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
