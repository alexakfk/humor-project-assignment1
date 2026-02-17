import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/vote
 * Inserts a vote into caption_votes. Requires authenticated user.
 * Body: { caption_id: string, vote_value: 1 | -1 }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Sign in to rate captions.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { caption_id, vote_value } = body as { caption_id?: string; vote_value?: number }

    if (!caption_id || typeof caption_id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid caption_id' },
        { status: 400 }
      )
    }

    if (vote_value !== 1 && vote_value !== -1) {
      return NextResponse.json(
        { error: 'vote_value must be 1 (upvote) or -1 (downvote)' },
        { status: 400 }
      )
    }

    const { error: insertError } = await supabase.from('caption_votes').insert({
      caption_id,
      profile_id: user.id,
      vote_value,
      created_datetime_utc: new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
