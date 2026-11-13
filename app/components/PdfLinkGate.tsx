'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PrintableGate, gatePrintable } from '../printables/PrintableGate'

/**
 * Site-wide email gate for DIRECT links to printables PDFs (owner decision,
 * Nov 14, 2026). About 14 blog posts deep-link PDFs on CloudFront; markdown
 * cannot open a modal, so a capture-phase click listener intercepts any
 * anchor to cloudfront.net/printables/<name>.pdf and runs the same gate the
 * printables pages use. Mounted ONCE in the root layout together with the
 * single PrintableGate instance (the printables layout no longer mounts its
 * own, or two modals would answer the same event).
 *
 * Skipped on purpose: PdfDownloadLink anchors (data-gated; they call
 * gatePrintable themselves), the gate's own fallback link (.pg-panel), and
 * modified-button clicks (middle/cmd-click), which browsers handle natively.
 * The raw hrefs stay in the DOM, so crawlers are unaffected.
 */
const PDF_LINK = /cloudfront\.net\/printables\/([a-z0-9-]+)\.pdf$/

export default function PdfLinkGate() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]')
      if (!a || a.hasAttribute('data-gated') || a.closest('.pg-panel')) return
      const href = a.getAttribute('href') || ''
      const m = href.match(PDF_LINK)
      if (!m) return
      if (gatePrintable({ kind: 'download', printable: `pdf/${m[1]}`, href })) {
        try {
          posthog.capture('printable_pdf_download', { printable: `pdf/${m[1]}`, via: 'content-link' })
        } catch { /* tracking must never block the download */ }
      } else {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return <PrintableGate />
}
