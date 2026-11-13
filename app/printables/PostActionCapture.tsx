'use client'

import { useCallback, useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { EmailCaptureCard } from '../blog/EmailCaptureCard'
import {
  magnetForPrintablePath,
  markPostActionShown,
  postActionSuppressed,
  type Magnet,
} from '@/lib/capture-state'

/**
 * The email ask that follows a printable's value moment: a PDF download or a
 * print. It NEVER gates anything. The download and the print dialog proceed
 * exactly as before; this only appears afterwards, once, and closes on X,
 * scrim or Escape. Mounted once in app/printables/layout.tsx; PdfDownloadLink
 * and PrintButton call requestPostActionCapture().
 *
 * Caps (lib/capture-state.ts): never after any submit on the site, at most
 * once a day, and not in a visit where an inline capture card was already on
 * screen.
 */

const EVENT = 'fk:postaction-capture'

type Detail = { kind: 'download' | 'print'; printable: string }

/** Called by the Download / Print controls. Safe to call anywhere. */
export function requestPostActionCapture(detail: Detail) {
  try { window.dispatchEvent(new CustomEvent<Detail>(EVENT, { detail })) } catch { /* never block the action */ }
}

const HEADINGS: Record<Magnet, string> = {
  'coloring-pages': 'Want the whole coloring set? We’ll email it to you.',
  'trivia-pack': 'Want the whole trivia pack? We’ll email it to you.',
  advent: 'Want the Advent readings too? We’ll email them to you.',
  'bedtime-kit': 'Want the Bedtime Bible Kit too? We’ll email it to you.',
  challenge: 'Want the 30-Day Bible Challenge too? We’ll email it to you.',
  'quiz-plan': 'Want your plan by email?',
}

export function PostActionCapture() {
  const [open, setOpen] = useState<null | { magnet: Magnet; printable: string; kind: Detail['kind'] }>(null)

  const close = useCallback((how: string) => {
    setOpen(cur => {
      if (cur) {
        try { posthog.capture('postaction_capture_dismissed', { how, printable: cur.printable, magnet: cur.magnet }) } catch { /* fine */ }
      }
      return null
    })
  }, [])

  useEffect(() => {
    function show(d: Detail) {
      if (postActionSuppressed()) return
      markPostActionShown()
      setOpen({ magnet: magnetForPrintablePath(location.pathname), printable: d.printable, kind: d.kind })
    }
    function onRequest(e: Event) {
      const d = (e as CustomEvent<Detail>).detail
      if (!d || postActionSuppressed()) return
      if (d.kind === 'print' && 'onafterprint' in window) {
        // Wait for the dialog to close. Registered before window.print() runs,
        // so a blocking print() still fires it after the dialog.
        window.addEventListener('afterprint', () => show(d), { once: true })
      } else {
        show(d)
      }
    }
    window.addEventListener(EVENT, onRequest)
    return () => window.removeEventListener(EVENT, onRequest)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close('escape') }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null

  return (
    <div className="no-print pac-scrim" onClick={() => close('scrim')} role="presentation">
      <div
        className="pac-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pac-title"
        onClick={e => e.stopPropagation()}
      >
        <button type="button" className="pac-x" aria-label="Close" onClick={() => close('x')}>
          &times;
        </button>
        <p className="pac-kicker">
          {open.kind === 'print' ? 'Enjoy your printable!' : 'Your PDF is opening in a new tab.'}
        </p>
        <h2 id="pac-title" className="pac-title">{HEADINGS[open.magnet]}</h2>
        <EmailCaptureCard
          magnet={open.magnet}
          source="printable-postaction"
          sourcePost={open.printable}
          placement="postaction"
          title=""
          compact
        />
      </div>
      <style>{`
        .pac-scrim{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px}
        .pac-panel{position:relative;background:#fff;border-radius:20px;max-width:440px;width:100%;padding:28px 22px 18px;box-shadow:0 20px 60px rgba(0,0,0,.25);text-align:center}
        .pac-x{position:absolute;top:8px;right:10px;width:40px;height:40px;border:0;background:transparent;font-size:28px;line-height:1;color:#6b7280;cursor:pointer;border-radius:999px}
        .pac-x:hover{background:#f3f4f6}
        .pac-kicker{margin:0 0 6px;color:#16a34a;font-weight:700;font-size:.9rem}
        .pac-title{margin:0 8px 4px;font-size:1.25rem;line-height:1.3;font-weight:800;color:#111827}
        @media (max-width:767px){
          .pac-scrim{align-items:flex-end;padding:0}
          .pac-panel{max-width:none;border-radius:20px 20px 0 0;padding:26px 16px calc(14px + env(safe-area-inset-bottom))}
        }
      `}</style>
    </div>
  )
}
