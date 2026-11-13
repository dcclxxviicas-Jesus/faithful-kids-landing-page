'use client'

import { useCallback, useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { EmailCaptureCard } from '../blog/EmailCaptureCard'
import { hasSubmittedCapture, magnetForPrintablePath, type Magnet } from '@/lib/capture-state'

/**
 * Email gate on printable Download and Print buttons (owner decision,
 * Nov 13, 2026: "put email for the printable otherwise you can't get it or
 * print it"). This reverses the earlier never-gate rule FOR THE BUTTONS ONLY.
 * The page content itself stays rendered in the HTML so Google can still
 * index it; that is why the rule existed.
 *
 * Flow: Download / Print click -> if this browser has ever submitted an email
 * on the site, proceed as normal. Otherwise this modal opens; submitting the
 * email unlocks a button that opens the PDF or the print dialog. That last
 * step is a fresh click on purpose: a window.open or print() after an async
 * request is blocked as a popup by most browsers.
 *
 * Mounted once in app/printables/layout.tsx; PdfDownloadLink and PrintButton
 * call gatePrintable().
 */

const EVENT = 'fk:printable-gate'

type Detail = { kind: 'download' | 'print'; printable: string; href?: string }

/** Returns true when the action may proceed now. Otherwise opens the gate. */
export function gatePrintable(detail: Detail): boolean {
  if (hasSubmittedCapture()) return true
  try { window.dispatchEvent(new CustomEvent<Detail>(EVENT, { detail })) } catch { return true }
  return false
}

const HEADINGS = {
  download: 'Enter your email to download this printable',
  print: 'Enter your email to print this page',
}

const MAGNET_LINE: Record<Magnet, string> = {
  'coloring-pages': 'We’ll also email you all 26 Bible coloring pages in one PDF.',
  'trivia-pack': 'We’ll also email you the Family Bible Trivia Pack, 100 questions with answers.',
  advent: 'We’ll also email you 25 days of Advent Bible readings.',
  'bedtime-kit': 'We’ll also email you the Bedtime Bible Kit, seven nights of short stories.',
  challenge: 'We’ll also email you the 30-Day Family Bible Challenge.',
  'quiz-plan': '',
}

export function PrintableGate() {
  const [open, setOpen] = useState<null | (Detail & { magnet: Magnet })>(null)
  const [unlocked, setUnlocked] = useState(false)

  const close = useCallback((how: string) => {
    setOpen(cur => {
      if (cur) {
        try { posthog.capture('printable_gate_closed', { how, printable: cur.printable, kind: cur.kind, unlocked }) } catch { /* fine */ }
      }
      return null
    })
  }, [unlocked])

  useEffect(() => {
    function onRequest(e: Event) {
      const d = (e as CustomEvent<Detail>).detail
      if (!d) return
      const magnet = magnetForPrintablePath(location.pathname)
      setUnlocked(false)
      setOpen({ ...d, magnet })
      try { posthog.capture('printable_gate_shown', { printable: d.printable, kind: d.kind, magnet }) } catch { /* fine */ }
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

  function onUnlock() {
    setUnlocked(true)
    try { posthog.capture('printable_gate_unlocked', { printable: open!.printable, kind: open!.kind }) } catch { /* fine */ }
  }

  return (
    <div className="no-print pg-scrim" onClick={() => close('scrim')} role="presentation">
      <div className="pg-panel" role="dialog" aria-modal="true" aria-labelledby="pg-title" onClick={e => e.stopPropagation()}>
        <button type="button" className="pg-x" aria-label="Close" onClick={() => close('x')}>&times;</button>
        <h2 id="pg-title" className="pg-title">{unlocked ? 'Thank you! It’s ready.' : HEADINGS[open.kind]}</h2>
        {!unlocked && MAGNET_LINE[open.magnet] && <p className="pg-sub">{MAGNET_LINE[open.magnet]}</p>}
        {unlocked ? (
          open.kind === 'download' && open.href ? (
            <a
              className="pg-go"
              href={open.href}
              target="_blank"
              rel="noopener"
              onClick={() => {
                try { posthog.capture('printable_pdf_download', { printable: open.printable, via: 'gate' }) } catch { /* fine */ }
                setOpen(null)
              }}
            >
              Open your printable
            </a>
          ) : (
            <button
              type="button"
              className="pg-go"
              onClick={() => { setOpen(null); setTimeout(() => window.print(), 50) }}
            >
              Print now
            </button>
          )
        ) : null}
        <div style={{ display: unlocked ? 'none' : 'block' }}>
          <EmailCaptureCard
            magnet={open.magnet}
            source="printable-gate"
            sourcePost={open.printable}
            placement="gate"
            title=""
            subtitle=""
            compact
            onSuccess={onUnlock}
          />
        </div>
      </div>
      <style>{`
        .pg-scrim{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px}
        .pg-panel{position:relative;background:#fff;border-radius:20px;max-width:440px;width:100%;padding:30px 22px 18px;box-shadow:0 20px 60px rgba(0,0,0,.25);text-align:center}
        .pg-x{position:absolute;top:8px;right:10px;width:40px;height:40px;border:0;background:transparent;font-size:28px;line-height:1;color:#6b7280;cursor:pointer;border-radius:999px}
        .pg-x:hover{background:#f3f4f6}
        .pg-title{margin:0 12px 6px;font-size:1.25rem;line-height:1.3;font-weight:800;color:#111827}
        .pg-sub{margin:0 0 4px;color:#4b5563;font-size:.93rem}
        .pg-go{display:inline-block;margin:14px 0 10px;background:#16a34a;color:#fff;font-weight:700;font-size:1rem;padding:13px 28px;border-radius:999px;border:0;cursor:pointer;text-decoration:none;box-shadow:0 4px 0 #15803d}
        @media (max-width:767px){
          .pg-scrim{align-items:flex-end;padding:0}
          .pg-panel{max-width:none;border-radius:20px 20px 0 0;padding:28px 16px calc(14px + env(safe-area-inset-bottom))}
        }
      `}</style>
    </div>
  )
}
