'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

const EMBED_CODE = `<iframe src="https://faithfulkids.app/embed/bible-trivia" width="100%" height="780" style="border:0;border-radius:16px;max-width:640px" title="Bible Trivia for Kids" loading="lazy"></iframe>
<p style="font-size:14px"><a href="https://faithfulkids.app/bible-trivia">Free Bible Trivia game by Faithful Kids</a></p>`

export function EmbedBox() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMBED_CODE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
      posthog.capture('trivia_embed_copied')
    } catch {
      // clipboard blocked — the code is visible to copy by hand
    }
  }

  return (
    <div>
      <pre
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 16,
          fontSize: '0.78rem',
          lineHeight: 1.6,
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          color: '#374151',
          margin: '0 0 12px',
        }}
      >
        {EMBED_CODE}
      </pre>
      <button
        onClick={copy}
        style={{
          background: copied ? '#065f46' : '#059669',
          color: '#fff',
          fontWeight: 800,
          fontSize: '0.92rem',
          padding: '11px 26px',
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {copied ? 'Copied! ✓' : 'Copy embed code'}
      </button>
    </div>
  )
}
