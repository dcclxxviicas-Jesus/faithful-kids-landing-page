'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

/** Live on the App Store since Aug 28 2026, Apple Kids Category. */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6761875106'

/* iPhone only, on purpose.
 *
 * There is no Android build, so a Play badge would be a dead end. iPad is
 * excluded too: the badge replaces the sticky CTA only where installing is
 * genuinely the lower-friction path, and that is a phone. Everything else
 * keeps the web CTA.
 *
 * Returns false on the server and the first paint, so markup never disagrees.
 */
export function useIsIPhone() {
  const [is, setIs] = useState(false)
  useEffect(() => {
    try { setIs(/iPhone/.test(navigator.userAgent)) } catch { /* keep false */ }
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
