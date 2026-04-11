'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Defer PostHog init to after page is interactive (doesn't block LCP)
    const timer = setTimeout(() => {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
      if (key && key !== 'phc_your_key_here') {
        posthog.init(key, {
          api_host: host || 'https://us.i.posthog.com',
          capture_pageview: true,
          capture_pageleave: true,
          disable_session_recording: true,
        })
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return <>{children}</>
}
