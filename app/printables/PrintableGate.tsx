'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { hasSubmittedCapture, markCaptureSubmitted, magnetForPdfHref, magnetForPrintablePath, type Magnet } from '@/lib/capture-state'
import PREVIEWS from '@/lib/printable-previews.json'

/**
 * Email gate on printable Download and Print buttons (owner decision,
 * Nov 13, 2026: "put email for the printable otherwise you can't get it or
 * print it"). This reverses the earlier never-gate rule FOR THE BUTTONS ONLY.
 * The page content itself stays rendered in the HTML so Google can still
 * index it; that is why the rule existed.
 *
 * Design (owner pick "A", Nov 14, 2026): a picture of the REAL printable on
 * the left (on phones, a small one beside the heading), "Get your <name>",
 * one email field, "Get my printable". Centred on every screen size, never a
 * bottom sheet. No line about the drip magnet: the owner felt "25 days of
 * Advent readings" read as a promise of a lot of email. The visitor is still
 * signed up for the page's magnet, exactly as before.
 *
 * The pictures are first-page renders of what actually prints (or of the PDF
 * that actually downloads), at CDN printable-previews/<key>.webp, listed with
 * their names in lib/printable-previews.json. Keys: page--<route> for a
 * printables page (slashes as --), file--<pdf path> for a PDF on the CDN.
 * A printable with no entry gets the same popup without the picture.
 * REBUILD the previews when a printable is added or its layout changes.
 *
 * Flow: Download / Print click -> if this browser has ever submitted an email
 * on the site, proceed as normal. Otherwise this modal opens; submitting the
 * email flips to "Thank you! It's ready." and after half a second continues
 * on its own (owner request, Nov 14, 2026). A window.open after an async
 * request is popup-blocked, so the download navigates THIS tab to the file
 * (location.assign is never popup-blocked; Back returns to the page), and
 * print() needs no gesture at all. A same-tab fallback link stays rendered
 * in case anything blocks the automatic step.
 *
 * Mounted ONCE, in the root layout via app/components/PdfLinkGate.tsx; a
 * second instance would answer the same event twice. PdfDownloadLink,
 * PrintButton and PdfLinkGate call gatePrintable().
 */

const EVENT = 'fk:printable-gate'
const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const NAMES = PREVIEWS as Record<string, string>

type Detail = { kind: 'download' | 'print'; printable: string; href?: string }
type Open = Detail & { magnet: Magnet; name: string | null; image: string | null }

/** Returns true when the action may proceed now. Otherwise opens the gate. */
export function gatePrintable(detail: Detail): boolean {
  if (hasSubmittedCapture()) return true
  try { window.dispatchEvent(new CustomEvent<Detail>(EVENT, { detail })) } catch { return true }
  return false
}

/** Which preview picture and name belong to this click. */
function previewFor(d: Detail): { name: string | null; image: string | null } {
  const m = d.href?.match(/cloudfront\.net\/(?:printables\/)?([a-z0-9/-]+)\.pdf(?:$|[?#])/)
  const fileKey = m ? 'file--' + m[1].replace(/\//g, '--') : null
  const path = location.pathname.replace(/\/$/, '')
  const pageKey = path.startsWith('/printables/')
    ? 'page--' + path.slice('/printables/'.length).replace(/\//g, '--')
    : null
  const has = (k: string | null): k is string => !!k && k in NAMES
  const imageKey = d.kind === 'download' && has(fileKey) ? fileKey : has(pageKey) ? pageKey : has(fileKey) ? fileKey : null
  const name = has(pageKey) ? NAMES[pageKey] : has(fileKey) ? NAMES[fileKey] : null
  return { name, image: imageKey ? `${CDN}/printable-previews/${imageKey}.webp` : null }
}

export function PrintableGate() {
  const [open, setOpen] = useState<Open | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState<'idle' | 'sending' | 'error'>('idle')
  const [imgOk, setImgOk] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

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
      const magnet = (d.href && magnetForPdfHref(d.href)) || magnetForPrintablePath(location.pathname)
      setUnlocked(false)
      setSending('idle')
      setImgOk(true)
      setOpen({ ...d, magnet, ...previewFor(d) })
      try {
        posthog.capture('printable_gate_shown', { printable: d.printable, kind: d.kind, magnet })
        posthog.capture('email_capture_shown', { magnet, source: 'printable-gate', post: d.printable, placement: 'gate' })
      } catch { /* fine */ }
    }
    window.addEventListener(EVENT, onRequest)
    return () => window.removeEventListener(EVENT, onRequest)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close('escape') }
    document.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => { document.removeEventListener('keydown', onKey); window.clearTimeout(t) }
  }, [open, close])

  /* Half a second of "Thank you! It's ready.", then continue to the file or
     the print dialog without another click. */
  useEffect(() => {
    if (!unlocked || !open) return
    const t = window.setTimeout(() => {
      if (open.kind === 'download' && open.href) {
        try {
          posthog.capture('printable_pdf_download', { printable: open.printable, via: 'gate' }, { transport: 'sendBeacon' })
        } catch { /* fine */ }
        window.location.assign(open.href)
      } else {
        setOpen(null)
        window.setTimeout(() => window.print(), 80)
      }
    }, 500)
    return () => window.clearTimeout(t)
  }, [unlocked, open])

  if (!open) return null
  const cur = open

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (sending === 'sending' || unlocked) return
    setSending('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, magnet: cur.magnet, source: 'printable-gate', sourcePost: cur.printable }),
      })
      if (!res.ok) throw new Error(String(res.status))
      markCaptureSubmitted()
      setUnlocked(true)
      try { posthog.identify(email.trim().toLowerCase()) } catch { /* fine */ }
      try {
        posthog.capture('email_capture_submitted', { magnet: cur.magnet, source: 'printable-gate', post: cur.printable, placement: 'gate' })
        posthog.capture('printable_gate_unlocked', { printable: cur.printable, kind: cur.kind })
      } catch { /* fine */ }
    } catch {
      setSending('error')
    }
  }

  const showImage = !!cur.image && imgOk
  const heading = unlocked ? 'Thank you! It’s ready.' : `Get your ${cur.name || 'free printable'}`

  return (
    <div className="no-print pg-scrim" onClick={() => close('scrim')} role="presentation">
      <div
        className={showImage ? 'pg-panel pg-has-art' : 'pg-panel'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pg-title"
        onClick={e => e.stopPropagation()}
      >
        <button type="button" className="pg-x" aria-label="Close" onClick={() => close('x')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        {showImage && (
          <div className="pg-art" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pg-sheet" src={cur.image!} alt="" onError={() => setImgOk(false)} />
          </div>
        )}
        <div className="pg-body">
          <div className="pg-head">
            {showImage && (
              <div className="pg-thumb" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pg-sheet" src={cur.image!} alt="" />
              </div>
            )}
            <div>
              <div className="pg-eyebrow">FREE PRINTABLE</div>
              <h2 id="pg-title" className={unlocked ? 'pg-title pg-fade' : 'pg-title'}>{heading}</h2>
            </div>
          </div>
          {unlocked ? (
            <div className="pg-fade">
              <p className="pg-sub">{cur.kind === 'download' ? 'Opening your printable…' : 'Opening the print dialog…'}</p>
              {cur.kind === 'download' && cur.href ? (
                <a className="pg-go-link" href={cur.href}>Tap here if it does not open</a>
              ) : null}
            </div>
          ) : (
            <>
              <p className="pg-sub">
                {cur.kind === 'download'
                  ? 'Enter your email and it opens right away.'
                  : 'Enter your email and it’s ready to print right away.'}
              </p>
              <form className="pg-form" onSubmit={submit}>
                <label htmlFor="pg-email" className="pg-label">Email address</label>
                <input
                  ref={inputRef}
                  id="pg-email"
                  className="pg-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <button type="submit" className="pg-btn" disabled={sending === 'sending'}>
                  {sending === 'sending' ? 'Sending…' : 'Get my printable'}
                </button>
                {sending === 'error' && <p className="pg-err" role="alert">Something went wrong, please try again.</p>}
              </form>
              <p className="pg-fine">Free. No spam. Unsubscribe anytime.</p>
            </>
          )}
        </div>
      </div>
      <style>{`
        .pg-scrim{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}
        .pg-panel{position:relative;background:#fff;border-radius:24px;width:100%;max-width:440px;box-shadow:0 24px 64px rgba(0,0,0,.28);display:flex;overflow:hidden;margin:auto;text-align:left}
        .pg-panel.pg-has-art{max-width:700px}
        .pg-x{position:absolute;top:10px;right:10px;width:44px;height:44px;border:0;border-radius:999px;background:transparent;color:#6b7280;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:1}
        .pg-x:hover{background:#f3f4f6}
        .pg-art{width:260px;flex-shrink:0;background:#f0fdf4;display:flex;align-items:center;justify-content:center;padding:32px 0}
        .pg-art .pg-sheet{width:168px}
        .pg-sheet{display:block;height:auto;background:#fff;border-radius:6px;box-shadow:0 10px 24px rgba(21,128,61,.18),0 2px 4px rgba(0,0,0,.06);transform:rotate(-4deg)}
        .pg-body{flex:1;min-width:0;padding:44px 40px 30px;display:flex;flex-direction:column;gap:14px}
        .pg-thumb{display:none}
        .pg-eyebrow{font-size:12px;font-weight:800;letter-spacing:.08em;color:#15803d;margin-bottom:6px}
        .pg-title{margin:0;padding-right:24px;font-size:28px;line-height:1.15;font-weight:800;color:#111827}
        .pg-sub{margin:0;font-size:16px;line-height:1.5;color:#4b5563}
        .pg-form{display:flex;flex-direction:column;gap:10px;margin-top:4px}
        .pg-label{font-size:13px;font-weight:700;color:#374151;margin-bottom:-4px}
        .pg-input{height:50px;box-sizing:border-box;border:2px solid #d1d5db;border-radius:14px;padding:0 16px;font:inherit;font-size:16px;color:#111827;outline:none;width:100%}
        .pg-input:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.18)}
        .pg-btn{height:52px;border:0;border-radius:999px;background:#16a34a;color:#fff;font:inherit;font-weight:800;font-size:17px;box-shadow:0 4px 0 #15803d;cursor:pointer;margin-top:4px}
        .pg-btn:hover{background:#15803d}
        .pg-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #15803d}
        .pg-btn:disabled{opacity:.7;cursor:default}
        .pg-err{margin:0;color:#b91c1c;font-size:14px}
        .pg-fine{margin:0;font-size:13px;color:#6b7280;text-align:center}
        .pg-go-link{display:inline-block;margin-top:8px;color:#15803d;font-weight:700;font-size:15px}
        .pg-fade{animation:pgfade .35s ease both}
        @keyframes pgfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @media (max-width:719px){
          .pg-panel,.pg-panel.pg-has-art{max-width:440px}
          .pg-art{display:none}
          .pg-body{padding:24px 20px 22px;gap:12px}
          .pg-head{display:flex;gap:16px;align-items:center;padding-right:28px}
          .pg-thumb{display:flex;width:92px;height:112px;flex-shrink:0;border-radius:14px;background:#f0fdf4;align-items:center;justify-content:center}
          .pg-thumb .pg-sheet{width:64px;border-radius:4px}
          .pg-eyebrow{font-size:11px}
          .pg-title{font-size:23px;padding-right:0}
          .pg-input{height:52px}
          .pg-btn{height:54px}
        }
      `}</style>
    </div>
  )
}
