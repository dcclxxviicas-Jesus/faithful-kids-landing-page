'use client'

import posthog from 'posthog-js'

/**
 * A real anchor that also fires a PostHog event.
 *
 * The old homepage drove its CTAs with `onClick={() => window.location.href =
 * '/quiz'}` on a <button>. That tracked fine but was invisible to crawlers —
 * a CTA is not always an anchor, and Lighthouse's "links are crawlable" audit
 * counts exactly this. Keeping the href real and hanging the capture off it
 * gets both.
 *
 * Capture is wrapped: analytics must never be able to swallow a navigation.
 */
export function TrackedLink({
  href,
  event,
  props,
  className,
  children,
}: {
  href: string
  event: string
  props?: Record<string, unknown>
  className?: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        try { posthog.capture(event, props) } catch { /* never block the click */ }
      }}
    >
      {children}
    </a>
  )
}
