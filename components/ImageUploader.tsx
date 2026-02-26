'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const API_BASE = 'https://api.almostcrackd.ai'
const ACCEPTED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png',
  'image/webp', 'image/gif', 'image/heic',
]
const STEP_LABELS = [
  'Getting upload URL',
  'Uploading image',
  'Registering image',
  'Generating captions',
]

type CaptionRecord = {
  id?: string
  content?: string
  text?: string
  [key: string]: unknown
}

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [stepNum, setStepNum] = useState(-1)
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captions, setCaptions] = useState<CaptionRecord[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((selected: File | null) => {
    if (!selected) return
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError(`Unsupported file type: ${selected.type}. Use JPEG, PNG, WebP, GIF, or HEIC.`)
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setError(null)
    setCaptions([])
    setStepNum(-1)
    setFailed(false)
  }, [preview])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files[0] ?? null)
  }

  async function handleUpload() {
    if (!file) return
    setError(null)
    setCaptions([])
    setFailed(false)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Not authenticated. Please sign in again.')
        return
      }
      const token = session.access_token
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      // Step 1: Generate presigned URL
      setStepNum(0)
      const presignedRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ contentType: file.type }),
      })
      if (!presignedRes.ok) throw new Error(await extractError(presignedRes, 'Failed to get upload URL'))
      const { presignedUrl, cdnUrl } = await presignedRes.json()

      // Step 2: Upload image bytes to the presigned URL
      setStepNum(1)
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!uploadRes.ok) throw new Error('Failed to upload image')

      // Step 3: Register the uploaded image URL with the pipeline
      setStepNum(2)
      const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      })
      if (!registerRes.ok) throw new Error(await extractError(registerRes, 'Failed to register image'))
      const { imageId } = await registerRes.json()

      // Step 4: Generate captions from the registered image
      setStepNum(3)
      const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ imageId }),
      })
      if (!captionRes.ok) throw new Error(await extractError(captionRes, 'Failed to generate captions'))
      const captionData = await captionRes.json()

      setCaptions(Array.isArray(captionData) ? captionData : [captionData])
      setStepNum(4)
    } catch (e) {
      setFailed(true)
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setStepNum(-1)
    setFailed(false)
    setError(null)
    setCaptions([])
    if (fileRef.current) fileRef.current.value = ''
  }

  const isProcessing = stepNum >= 0 && stepNum < 4 && !failed

  return (
    <div className="uploader">
      <div
        className={`uploader-dropzone${preview ? ' uploader-dropzone-has-file' : ''}${isProcessing ? ' uploader-dropzone-disabled' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={isProcessing ? undefined : handleDrop}
        onClick={() => !isProcessing && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          hidden
        />
        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="Selected" className="uploader-preview" />
        ) : (
          <div className="uploader-placeholder">
            <UploadIcon />
            <p>Drop an image here or click to browse</p>
            <span className="uploader-hint">JPEG, PNG, WebP, GIF, HEIC</span>
          </div>
        )}
      </div>

      <div className="uploader-actions">
        {file && stepNum === -1 && (
          <button className="uploader-btn uploader-btn-primary" onClick={handleUpload}>
            Upload &amp; Generate Captions
          </button>
        )}
        {(file || stepNum >= 0) && !isProcessing && (
          <button className="uploader-btn uploader-btn-secondary" onClick={reset}>
            {stepNum === 4 ? 'Upload Another' : 'Clear'}
          </button>
        )}
      </div>

      {stepNum >= 0 && (
        <div className="uploader-progress">
          {STEP_LABELS.map((label, i) => {
            let status: 'done' | 'active' | 'pending' | 'error'
            if (stepNum > i || stepNum === 4) status = 'done'
            else if (stepNum === i && !failed) status = 'active'
            else if (stepNum === i && failed) status = 'error'
            else status = 'pending'
            return <ProgressStep key={label} label={label} status={status} />
          })}
        </div>
      )}

      {error && <p className="error uploader-error">{error}</p>}

      {captions.length > 0 && (
        <div className="uploader-results">
          <h3 className="uploader-results-title">Generated Captions</h3>
          <div className="uploader-captions">
            {captions.map((c, i) => (
              <div key={c.id ?? i} className="uploader-caption-card">
                <span className="uploader-caption-num">{i + 1}</span>
                <p className="uploader-caption-text">
                  {c.content ?? c.text ?? JSON.stringify(c)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    return body.message ?? body.error ?? fallback
  } catch {
    return fallback
  }
}

function ProgressStep({ label, status }: { label: string; status: 'done' | 'active' | 'pending' | 'error' }) {
  return (
    <div className={`uploader-step uploader-step-${status}`}>
      <span className="uploader-step-icon">
        {status === 'done' && <CheckIcon />}
        {status === 'active' && <SpinnerIcon />}
        {status === 'error' && <XIcon />}
        {status === 'pending' && <CircleIcon />}
      </span>
      <span className="uploader-step-label">{label}</span>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="uploader-spinner">
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}
