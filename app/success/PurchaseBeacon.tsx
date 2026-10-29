'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { metaTrack } from '../MetaPixel'

/* Client half of /success. The page itself is server-rendered (so the
   fail-safe button is in the HTML with or without JavaScript); this only
   fires the analytics and forwards the buyer to the app.

   purchase_complete fires here under the browser distinct_id that did the
   quiz and the checkout click, which the server-side stripe:cus_XXX event
   can never be joined to. A refresh or back-button revisit of the same
   session_id must not count twice, hence the sessionStorage guard. */

const FORWARD_MS = 500

export default function PurchaseBeacon({ sessionId, href }: { sessionId: string; href: string }) {
  const [forwarding, setForwarding] = useState(false)

  useEffect(() => {
    const key = `fk_purchase_captured_${sessionId}`
    let seen = false
    try { seen = sessionStorage.getItem(key) === '1' } catch {}
    if (!seen) {
      posthog.capture('purchase_complete', { session_id: sessionId })
      metaTrack('Purchase')
      try { sessionStorage.setItem(key, '1') } catch {}
    }
    setForwarding(true)
    const t = window.setTimeout(() => { window.location.replace(href) }, FORWARD_MS)
    return () => window.clearTimeout(t)
  }, [sessionId, href])

  return (
    <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 16 }} aria-live="polite">
      {forwarding ? 'Taking you there now…' : 'Tap the button if this page does not move on by itself.'}
    </p>
  )
}
