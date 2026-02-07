'use client'

import { useState } from 'react'
import { getGoogleAuthUrl } from '@/lib/auth'

export default function GatedUI() {
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setLoading(true)
    try {
      const url = await getGoogleAuthUrl()
      window.location.href = url
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <div className="gated-ui">
      <div className="gated-ui-card">
        <h2 className="gated-ui-title">Assignment 3</h2>
        <p className="gated-ui-text">
          This route is protected. Sign in with Google to continue.
        </p>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="gated-ui-button"
        >
          {loading ? 'Redirecting…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}
