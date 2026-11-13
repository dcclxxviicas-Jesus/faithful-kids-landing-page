'use client'

import type { CSSProperties, ReactNode } from 'react'
import posthog from 'posthog-js'
import { gatePrintable } from './PrintableGate'

/**
 * The tracked download link used on every printables page (PDFs, and the
 * coloring pages' PNG). Fires printable_pdf_download so /cas-admin and
 * PostHog can count kit downloads.
 *
 * Email-gated since Nov 13, 2026 (owner decision): until this browser has
 * submitted an email, the click opens PrintableGate instead of the file.
 * Opens in a new tab because the CDN serves files inline.
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
      target="_blank"
      rel="noopener"
      className={className}
      style={style}
      data-gated="1"
      onClick={e => {
        if (!gatePrintable({ kind: 'download', printable, href })) {
          e.preventDefault()
          return
        }
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
