'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

// Meta Pixel. Renders nothing until NEXT_PUBLIC_META_PIXEL_ID is set, so this
// is inert until the ad account exists. Standard events are fired from the
// places that matter (quiz start, checkout click) rather than only pageviews,
// because Meta can only optimise toward events it can see.

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function metaTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', event, params)
}

function PageViewOnRouteChange() {
  const pathname = usePathname()
  const search = useSearchParams()
  useEffect(() => {
    // App Router does not reload the page between routes, so the pixel's
    // automatic first PageView is the only one it would ever send.
    if (window.fbq) window.fbq('track', 'PageView')
  }, [pathname, search])
  return null
}

export function MetaPixel() {
  if (!PIXEL_ID) return null
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');fbq('track','PageView');
      `}</Script>
      <noscript>
        <img
          height="1" width="1" style={{ display: 'none' }} alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewOnRouteChange />
      </Suspense>
    </>
  )
}
