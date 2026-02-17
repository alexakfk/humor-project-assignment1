'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type CaptionData = { id: string; content: string; imageUrl: string }

type CaptionVoterProps = {
  current: CaptionData
  next: CaptionData | null
  captionsLeft: number
}

export default function CaptionVoter({
  current,
  next,
  captionsLeft,
}: CaptionVoterProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voted, setVoted] = useState<1 | -1 | null>(null)
  const [display, setDisplay] = useState<CaptionData | null>(current)
  const [displayCount, setDisplayCount] = useState(captionsLeft)
  const [showEmpty, setShowEmpty] = useState(false)

  // Reset when we receive new props (e.g. after router.refresh())
  useEffect(() => {
    setDisplay(current)
    setDisplayCount(captionsLeft)
    setVoted(null)
    setShowEmpty(false)
  }, [current, captionsLeft])

  async function handleVote(voteValue: 1 | -1) {
    if (loading || voted !== null) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption_id: current.id, vote_value: voteValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Vote failed')
      setVoted(voteValue)
      setDisplayCount((c) => Math.max(0, c - 1))
      // Brief feedback, then show preloaded next caption or empty state
      setTimeout(() => {
        if (next) {
          setDisplay(next)
        } else {
          setShowEmpty(true)
          setDisplay(null)
        }
        router.refresh()
      }, 120)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Vote failed')
    } finally {
      setLoading(false)
    }
  }

  if (showEmpty) {
    return (
      <div className="caption-voter-empty">
        <p>Thanks for rating! No more captions to rate right now.</p>
      </div>
    )
  }

  return (
    <div className="caption-voter">
      <div className="caption-voter-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={display!.imageUrl}
          alt=""
          className="caption-voter-image"
        />
      </div>
      <p className="caption-voter-text">{display!.content}</p>
      <div className="caption-voter-buttons">
        <button
          type="button"
          onClick={() => handleVote(-1)}
          disabled={loading}
          className={`caption-voter-btn caption-voter-btn-down ${voted === -1 ? 'caption-voter-btn-selected' : ''}`}
          aria-label="Downvote"
        >
          <ThumbsDownIcon />
        </button>
        <button
          type="button"
          onClick={() => handleVote(1)}
          disabled={loading}
          className={`caption-voter-btn caption-voter-btn-up ${voted === 1 ? 'caption-voter-btn-selected' : ''}`}
          aria-label="Upvote"
        >
          <ThumbsUpIcon />
        </button>
      </div>
      {error && <p className="error caption-voter-error">{error}</p>}
      <p className="caption-voter-count">{displayCount} CAPTIONS LEFT</p>
    </div>
  )
}

function ThumbsDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  )
}

function ThumbsUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}
