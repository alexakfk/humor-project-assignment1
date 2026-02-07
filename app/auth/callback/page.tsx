'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  getCodeVerifierAndState,
  clearCodeVerifierAndState,
} from '@/lib/auth'

function getRedirectUri(): string {
  const fixed = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI
  if (fixed) return fixed.replace(/\/$/, '')
  if (typeof window !== 'undefined')
    return `${window.location.origin}/auth/callback`
  return ''
}

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'exchanging' | 'done' | 'error'>(
    'exchanging'
  )
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const code = searchParams?.get('code')
    const state = searchParams?.get('state')

    if (!code) {
      setStatus('error')
      setErrorMessage('No authorization code received.')
      return
    }

    const stored = getCodeVerifierAndState()
    if (!stored) {
      setStatus('error')
      setErrorMessage('Session expired. Please try signing in again.')
      return
    }
    if (state && state !== stored.state) {
      setStatus('error')
      setErrorMessage('Invalid state. Please try again.')
      clearCodeVerifierAndState()
      return
    }

    const redirectUri = getRedirectUri()

    fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        code_verifier: stored.verifier,
        redirect_uri: redirectUri,
      }),
    })
      .then((res) => {
        clearCodeVerifierAndState()
        if (!res.ok) return res.json().then((d) => Promise.reject(d))
        return res.json()
      })
      .then(() => {
        setStatus('done')
        router.replace('/assignment-3')
      })
      .catch((err) => {
        setStatus('error')
        setErrorMessage(
          err?.error || err?.details || 'Sign-in failed. Please try again.'
        )
      })
  }, [searchParams, router])

  return (
    <div className="content-page">
      <h1 className="page-title">Signing in</h1>
      {status === 'exchanging' && <p className="page-subtitle">Completing sign-in…</p>}
      {status === 'done' && <p className="page-subtitle">Redirecting…</p>}
      {status === 'error' && (
        <>
          <p className="error">{errorMessage}</p>
          <a href="/assignment-3">Back to Assignment 3</a>
        </>
      )}
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="content-page">
          <h1 className="page-title">Signing in</h1>
          <p className="page-subtitle">Loading…</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
