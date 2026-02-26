'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UserMenu() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      await fetch('/api/auth/logout', { method: 'POST' })
      router.refresh()
      router.push('/')
    } catch {
      setSigningOut(false)
    }
  }

  if (loading || !email) return null

  return (
    <div className="user-menu">
      <div className="user-menu-info">
        <div className="user-menu-avatar">{email[0].toUpperCase()}</div>
        <span className="user-menu-email" title={email}>{email}</span>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="user-menu-btn"
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
