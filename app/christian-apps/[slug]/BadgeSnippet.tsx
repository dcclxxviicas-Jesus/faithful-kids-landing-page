'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

/* Brand anchor only (anchor-text policy): the badge says "Listed on Faithful
 * Kids" and points at this listing's own page, never the homepage. */
export function BadgeSnippet({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false)
  const code = `<a href="https://faithfulkids.app/christian-apps/${slug}" title="${name.replace(/"/g, '&quot;')} on Faithful Kids"><img src="https://faithfulkids.app/badges/listed-on-faithful-kids.svg" alt="Listed on Faithful Kids" width="200" height="56"></a>`
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2500) } catch { /* noop */ }
    try { posthog.capture('app_directory_badge_copy', { slug }) } catch { /* noop */ }
  }
  return (
    <div className="ad-badge">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/badges/listed-on-faithful-kids.svg" alt="Listed on Faithful Kids" width={200} height={56} />
      <textarea readOnly value={code} rows={3} aria-label="Badge HTML snippet" onFocus={e => e.currentTarget.select()} />
      <button type="button" className="ad-btn" onClick={copy}>{copied ? 'Copied' : 'Copy the code'}</button>
    </div>
  )
}
