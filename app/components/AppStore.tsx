'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

/** Live on the App Store since Aug 28 2026, Apple Kids Category. */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6761875106'

/** Live on Google Play since Oct 2026. */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.faithfulkids.app'

export type MobileStore = 'apple' | 'android'

/* Which app store, if any, this device can actually install from.
 *
 * Apple: iPhone AND iPad. The app is universal — the listing carries 6 iPad
 * screenshots and 80 iPad models. The Macintosh clause is not a mistake:
 * iPadOS 13+ reports a desktop Safari user agent containing "Macintosh" and no
 * "iPad" at all, so matching /iPad/ alone misses most iPads in service.
 * maxTouchPoints separates them — an iPad reports 5, a real Mac reports 0.
 *
 * Android: anything reporting Android, EXCEPT Amazon Fire tablets. Fire OS is
 * Android underneath and says so in its user agent, but those devices ship
 * without the Play Store, so a Play badge there is a dead end. They identify
 * themselves by Silk (the browser) or a KF* model code.
 *
 * Desktops get neither and keep the web CTA — they cannot install the app.
 *
 * Returns null on the server and the first paint, so markup never disagrees.
 */
export function useMobileStore(): MobileStore | null {
  const [store, setStore] = useState<MobileStore | null>(null)
  useEffect(() => {
    try {
      const ua = navigator.userAgent
      const iPadOS = /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1
      if (/iPhone|iPad|iPod/.test(ua) || iPadOS) { setStore('apple'); return }
      const amazonFire = /\bSilk\b/.test(ua) || /\bKF[A-Z]{2,}\b/.test(ua)
      if (/Android/.test(ua) && !amazonFire) setStore('android')
    } catch { /* keep null */ }
  }, [])
  return store
}

export function AppStoreBadge({ location, height = 40 }: { location: string; height?: number }) {
  return (
    <a
      href={APP_STORE_URL}
      className="appstore-badge"
      onClick={() => { try { posthog.capture('app_store_click', { location, store: 'apple' }) } catch { /* never block */ } }}
      aria-label="Download Faithful Kids on the App Store"
    >
      {/* Apple's official badge artwork, served locally rather than hotlinked. */}
      <img src="/app-store-badge.svg" alt="Download on the App Store" height={height} />
    </a>
  )
}

export function PlayStoreBadge({ location, height = 40 }: { location: string; height?: number }) {
  return (
    <a
      href={PLAY_STORE_URL}
      /* Carries .appstore-badge too — that class is the shared sizing/press
         hook (40px, 36px under 360px, 44px in the nav), so the two badges stay
         the same height on their respective devices without a parallel set of
         rules that could drift apart. */
      className="appstore-badge playstore-badge"
      onClick={() => { try { posthog.capture('play_store_click', { location, store: 'google' }) } catch { /* never block */ } }}
      aria-label="Get Faithful Kids on Google Play"
    >
      {/* Google's official badge artwork, cropped to the badge itself and
          served locally. The clear space Google asks for is the surrounding
          layout gap, not baked into the file — otherwise the padding renders
          as dead space inside the flex row and the badge looks undersized
          next to everything beside it. */}
      <img src="/google-play-badge.png" alt="Get it on Google Play" height={height} />
    </a>
  )
}

/** The badge this device can act on, or null on desktop. */
export function StoreBadge({ store, location, height = 40 }: {
  store: MobileStore
  location: string
  height?: number
}) {
  return store === 'apple'
    ? <AppStoreBadge location={location} height={height} />
    : <PlayStoreBadge location={location} height={height} />
}
