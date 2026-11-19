'use client'

import { useRef, useState } from 'react'
import posthog from 'posthog-js'

/* The affiliate application. Posts to /api/affiliates/apply, which stores it
   for review in /cas-admin/affiliates and emails team@ plus a receipt to the
   applicant. Ticking the terms box is the clickwrap acceptance. */

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Other']

export function ApplyForm() {
  const started = useRef(Date.now())
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true); setErr(''); setFields({})
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'), email: fd.get('email'), website: fd.get('website'), audience: fd.get('audience'),
      plan: fd.get('plan'), country: fd.get('country'), agree: fd.get('agree') === 'on',
      company_site: fd.get('company_site'), elapsedMs: Date.now() - started.current, source: '/affiliates',
    }
    try {
      const res = await fetch('/api/affiliates/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await res.json().catch(() => ({}))
      if (res.ok) {
        setDone(true)
        try { posthog.capture('affiliate_apply', { country: String(body.country || '') }) } catch { /* noop */ }
      } else { setErr(j.error || 'Something went wrong.'); setFields(j.fields || {}) }
    } catch { setErr('Network error. Please try again.') }
    setBusy(false)
  }

  if (done) return (
    <div className="af-done" role="status">
      <h3>Thanks, we have your application.</h3>
      <p>We sent a confirmation to your email. A real person reads every application and replies either way, usually within a few days.</p>
      <p>If you are approved, that email brings your personal link and your private stats page.</p>
    </div>
  )

  const E = ({ k }: { k: string }) => fields[k] ? <span className="af-err">{fields[k]}</span> : null

  return (
    <form className="af-form" onSubmit={onSubmit} noValidate>
      {err && <div className="af-formerr" role="alert">{err}</div>}
      <fieldset>
        <div className="af-two">
          <div className="af-f"><label htmlFor="af-name">Your name</label><input id="af-name" name="name" type="text" autoComplete="name" maxLength={120} /><E k="name" /></div>
          <div className="af-f"><label htmlFor="af-email">Email</label><input id="af-email" name="email" type="email" autoComplete="email" maxLength={254} /><E k="email" /></div>
        </div>
        <div className="af-f"><label htmlFor="af-web">Where you publish</label>
          <input id="af-web" name="website" type="text" maxLength={600} placeholder="Your site, channel or handles" /><E k="website" /></div>
        <div className="af-f"><label htmlFor="af-aud">Your audience</label>
          <textarea id="af-aud" name="audience" maxLength={1200} placeholder="Who follows you, and roughly how many" /><E k="audience" /></div>
        <div className="af-f"><label htmlFor="af-plan">How you would share Faithful Kids</label>
          <textarea id="af-plan" name="plan" maxLength={1500} placeholder="A post, a video, a curriculum review, a newsletter mention..." /><E k="plan" /></div>
        <div className="af-f"><label htmlFor="af-country">Where you live</label>
          <select id="af-country" name="country" defaultValue="">
            <option value="" disabled>Choose one</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <small>We ask because US affiliates need a W-9 and others a W-8BEN before the first payout.</small><E k="country" /></div>
        <div className="af-hp" aria-hidden="true"><label>Company site<input name="company_site" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="af-f">
          <label className="af-agree"><input type="checkbox" name="agree" />
            <span>I have read and agree to the <a href="/affiliates/terms" target="_blank">affiliate program terms</a>, including disclosing my affiliate links.</span>
          </label><E k="agree" />
        </div>
      </fieldset>
      <button className="af-btn" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Apply to the program'}</button>
    </form>
  )
}
