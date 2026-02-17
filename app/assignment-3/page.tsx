import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SESSION_COOKIE } from '@/lib/auth'
import GatedUI from '@/components/GatedUI'
import CaptionVoter from '@/components/CaptionVoter'

export const dynamic = 'force-dynamic'

export default async function Assignment3() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  const isAuthenticated = !!session?.value

  if (!isAuthenticated) {
    return (
      <div className="content-page">
        <h1 className="page-title">Assignment 3</h1>
        <GatedUI />
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="content-page">
        <h1 className="page-title">Assignment 3</h1>
        <GatedUI />
      </div>
    )
  }

  // Get caption IDs the user has already voted on
  const { data: votedRows } = await supabase
    .from('caption_votes')
    .select('caption_id')
    .eq('profile_id', user.id)
  const votedCaptionIds = votedRows?.map((r) => r.caption_id) ?? []

  // Fetch captions with images (that have valid URLs)
  const { data: captionsWithImages } = await supabase
    .from('captions')
    .select(`
      id,
      content,
      image_id,
      images!inner (url)
    `)
    .not('image_id', 'is', null)
    .not('content', 'is', null)

  const captions = captionsWithImages ?? []
  const imageMap = new Map<string, string>()
  for (const c of captions) {
    const img = c.images as { url?: string } | null
    if (img?.url) imageMap.set(c.id, img.url)
  }

  // Filter to captions user hasn't voted on
  const available = captions.filter(
    (c) => !votedCaptionIds.includes(c.id) && imageMap.has(c.id)
  )
  const captionsLeft = available.length

  const current = available[0] ?? null
  const next = available[1] ?? null

  return (
    <div className="content-page">
      <h1 className="page-title">Assignment 3</h1>
      <p className="page-subtitle">Rate captions to help us improve.</p>
      {current ? (
        <CaptionVoter
          current={{
            id: current.id,
            content: current.content ?? '',
            imageUrl: imageMap.get(current.id) ?? '',
          }}
          next={next ? {
            id: next.id,
            content: next.content ?? '',
            imageUrl: imageMap.get(next.id) ?? '',
          } : null}
          captionsLeft={captionsLeft}
        />
      ) : (
        <div className="caption-voter-empty">
          <p>No more captions to rate right now. Check back later!</p>
        </div>
      )}
    </div>
  )
}
