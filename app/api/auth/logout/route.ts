import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SESSION_COOKIE } from '@/lib/auth'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Continue even if Supabase signOut fails
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
