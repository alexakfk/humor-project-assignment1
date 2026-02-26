import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import GatedUI from '@/components/GatedUI'
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
        <GatedUI
          title="Sign in Required"
          description="Sign in with Google to upload images and generate captions."
        />
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="content-page">
        <h1 className="page-title">Assignment 5</h1>
        <GatedUI
          title="Session Expired"
          description="Your session has expired. Please sign in again."
        />
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
