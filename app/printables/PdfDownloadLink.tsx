'use client'

import type { CSSProperties, ReactNode } from 'react'
import posthog from 'posthog-js'

/**
 * Drop-in replacement for the plain <a> PDF buttons on printables pages.
 * Fires printable_pdf_download so /cas-admin and PostHog can count kit
 * downloads (before this, 261 Jesse Tree visitors/week were invisible
 * past the pageview).
 */
export default function PdfDownloadLink({
  href,
  printable,
  className,
  style,
  children,
}: {
  href: string
  printable: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={() => {
        try {
          posthog.capture('printable_pdf_download', { printable })
        } catch {
          /* tracking must never block the download */
        }
      }}
    >
      {children}
    </a>
  )
}
