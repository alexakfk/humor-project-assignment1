import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/auth'
import GatedUI from '@/components/GatedUI'

export default async function Assignment3() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  const isAuthenticated = !!session?.value

  return (
    <div className="content-page">
      <h1 className="page-title">Assignment 3</h1>
      {isAuthenticated ? (
        <div className="gated-ui protected-content">
          <p className="page-subtitle">You’re signed in! This is the protected content.</p>
          <p className="page-subtitle">(this was way harder than I thought it would be...but i got it!)</p>
        </div>
      ) : (
        <GatedUI />
      )}
    </div>
  )
}
