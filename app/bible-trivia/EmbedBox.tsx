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
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <pre className="tg-embed-code">{EMBED_CODE}</pre>
      <button className="tg-btn" onClick={copy}>
        {copied ? 'Copied! ✓' : 'Copy embed code'}
      </button>
    </div>
  )
}
