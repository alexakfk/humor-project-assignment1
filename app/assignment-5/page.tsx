import Link from 'next/link'
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import ImageUploader from '@/components/ImageUploader'

export const dynamic = 'force-dynamic'

export default async function Assignment5() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  const isAuthenticated = !!session?.value

  if (!isAuthenticated) {
    return (
      <div className="content-page">
        <h1 className="page-title">Assignment 5</h1>
        <div className="gated-ui">
          <div className="gated-ui-card">
            <p className="gated-ui-text">
              Log in through <Link href="/assignment-3" className="gated-ui-link">Assignment 3</Link> to unlock the content of this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="content-page">
        <h1 className="page-title">Assignment 5</h1>
        <div className="gated-ui">
          <div className="gated-ui-card">
            <p className="gated-ui-text">
              Log in through <Link href="/assignment-3" className="gated-ui-link">Assignment 3</Link> to unlock the content of this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-page">
      <h1 className="page-title">Assignment 5</h1>
      <p className="page-subtitle">Upload an image and get AI-generated captions.</p>
      <ImageUploader />
    </div>
  )
}
