'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

/** Live on the App Store since Aug 28 2026, Apple Kids Category. */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6761875106'

/* Apple touch devices — iPhone AND iPad. The app is universal: the listing
 * carries 6 iPad screenshots and 80 iPad models.
 *
 * There is no Android build, so a Play badge would be a dead end, and Macs get
 * the web CTA since they cannot install it.
 *
 * The Macintosh clause is not a mistake. iPadOS 13+ reports a desktop Safari
 * user agent containing "Macintosh" and no "iPad" at all, so matching /iPad/
 * alone misses most iPads in service. maxTouchPoints separates them: an iPad
 * reports 5, a real Mac reports 0.
 *
 * Returns false on the server and the first paint, so markup never disagrees.
 */
export function useIsAppleTouch() {
  const [is, setIs] = useState(false)
  useEffect(() => {
    try {
      const ua = navigator.userAgent
      const iPadOS = /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1
      setIs(/iPhone|iPad|iPod/.test(ua) || iPadOS)
    } catch { /* keep false */ }
  }, [])
  return is
}

export function AppStoreBadge({ location, height = 40 }: { location: string; height?: number }) {
  return (
    <a
      href={APP_STORE_URL}
      className="appstore-badge"
      onClick={() => { try { posthog.capture('app_store_click', { location }) } catch { /* never block */ } }}
      aria-label="Download Faithful Kids on the App Store"
    >
      {/* Apple's official badge artwork, served locally rather than hotlinked. */}
      <img src="/app-store-badge.svg" alt="Download on the App Store" height={height} />
    </a>
  )
}
