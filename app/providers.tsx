'use client'

import posthog from 'posthog-js'
import { startCtaTracking } from '@/lib/cta-anchor'

// Init at module scope (import time) so it runs before any component's
// useEffect — the previous 3s-deferred init silently dropped every capture
// fired in the first seconds (quiz_started on mount, pageviews from
// quick-bouncing visitors, events fired right before a redirect).
if (typeof window !== 'undefined' && !posthog.__loaded) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (key && key !== 'phc_your_key_here') {
    posthog.init(key, {
      // Proxied through our own domain (see rewrites in next.config.js)
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
    })
    // Re-apply the internal flag on every load: super-properties live in
    // PostHog's own storage, which a cache clear or a different profile can
    // drop while our marker survives.
    try {
      if (localStorage.getItem('fk_internal') === '1') posthog.register({ internal: true })
    } catch {
      // ignore
    }
  }
}

// One listener for the whole site: remembers where the pointer was on the
// last CTA press so the quiz welcome screen can put Begin under it.
startCtaTracking()

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
