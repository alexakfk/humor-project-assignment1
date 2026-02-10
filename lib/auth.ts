/**
 * PKCE and Google OAuth helpers for Assignment 3.
 * No client secret. Redirect URI must match exactly what is registered in
 * Google Cloud Console for this OAuth client.
 */

export const SESSION_COOKIE = 'ak_oauth_session'
export const PKCE_COOKIE = 'ak_oauth_pkce'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const CODE_VERIFIER_KEY = 'ak_oauth_code_verifier'
const STATE_KEY = 'ak_oauth_state'

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  }
  return base64UrlEncode(array.buffer)
}

export async function computeCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(digest)
}

export function saveCodeVerifierAndState(verifier: string, state: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CODE_VERIFIER_KEY, verifier)
    sessionStorage.setItem(STATE_KEY, state)
  }
}

export function getCodeVerifierAndState(): { verifier: string; state: string } | null {
  if (typeof window === 'undefined') return null
  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY)
  const state = sessionStorage.getItem(STATE_KEY)
  if (!verifier || !state) return null
  return { verifier, state }
}

export function clearCodeVerifierAndState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CODE_VERIFIER_KEY)
    sessionStorage.removeItem(STATE_KEY)
  }
}

/**
 * Returns Supabase's auth callback URL (where Google redirects to).
 * Flow: App → Google → Supabase → App
 */
export function getRedirectUri(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  // Supabase auth callback endpoint
  return `https://secure.almostcrackd.ai/auth/v1/callback`
}

/**
 * Returns the app's callback URL (where Supabase redirects after auth).
 * This is passed as redirect_to parameter to tell Supabase where to send the user.
 */
export function getAppCallbackUrl(): string {
  const fixed = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI
  if (fixed) return fixed.replace(/\/+$/, '')
  if (typeof window !== 'undefined')
    return `${window.location.origin}/auth/callback`
  return ''
}

export async function getGoogleAuthUrl(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')

  const verifier = generateCodeVerifier()
  const challenge = await computeCodeChallenge(verifier)
  const state = base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)).buffer)

  const redirectUri = getRedirectUri()
  if (!redirectUri) throw new Error('Redirect URI could not be determined')

  saveCodeVerifierAndState(verifier, state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}
