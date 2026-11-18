'use client'

import { useRef, useState } from 'react'
import posthog from 'posthog-js'
import { CATEGORIES, AGE_GROUPS, PRICE_LABEL } from '@/lib/christian-apps-meta'

const ROLES = ['I made it', 'I work for the maker', 'I am a parent or user', 'Other']

export function SubmitForm() {
  const started = useRef(Date.now())
  const [kind, setKind] = useState<'app' | 'website'>('app')
  const [ages, setAges] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true); setErr(''); setFields({})
    const fd = new FormData(e.currentTarget)
    const body = {
      kind, ageGroups: ages,
      name: fd.get('name'), maker: fd.get('maker'), category: fd.get('category'), ages: fd.get('ages'),
      priceModel: fd.get('priceModel'), price: fd.get('price'),
      iosUrl: fd.get('iosUrl'), androidUrl: fd.get('androidUrl'), webUrl: fd.get('webUrl'),
      description: fd.get('description'), contactName: fd.get('contactName'), contactEmail: fd.get('contactEmail'),
      contactRole: fd.get('contactRole'), notes: fd.get('notes'), confirm: fd.get('confirm') === 'on',
      company_site: fd.get('company_site'), elapsedMs: Date.now() - started.current, source: '/christian-apps/submit',
    }
    try {
      const res = await fetch('/api/christian-apps/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await res.json().catch(() => ({}))
      if (res.ok) {
        setDone(true)
        try { posthog.capture('app_directory_submit', { kind, category: String(body.category) }) } catch { /* noop */ }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else { setErr(j.error || 'Something went wrong.'); setFields(j.fields || {}) }
    } catch { setErr('Network error. Please try again.') }
    setBusy(false)
  }

  if (done) return (
    <div className="ad-done">
      <h2>Thanks, we have it.</h2>
      <p>We sent a confirmation to your email. Every submission is reviewed by our team, and if yours is approved we will email you the link to its page.</p>
      <p><a href="/christian-apps">Back to the directory</a></p>
    </div>
  )

  const E = ({ k }: { k: string }) => fields[k] ? <span className="ad-err">{fields[k]}</span> : null

  return (
    <form onSubmit={onSubmit} noValidate>
      {err && <div className="ad-formerr" role="alert">{err}</div>}
      <fieldset>
        <legend>What are you submitting?</legend>
        <div className="ad-kind">
          <label className={kind === 'app' ? 'on' : ''}><input type="radio" name="kind" checked={kind === 'app'} onChange={() => setKind('app')} />An app</label>
          <label className={kind === 'website' ? 'on' : ''}><input type="radio" name="kind" checked={kind === 'website'} onChange={() => setKind('website')} />A website</label>
        </div>
      </fieldset>

      <fieldset>
        <legend>About the {kind}</legend>
        <div className="ad-two">
          <div className="ad-f"><label htmlFor="f-name">Name</label><input id="f-name" name="name" type="text" required maxLength={120} /><E k="name" /></div>
          <div className="ad-f"><label htmlFor="f-maker">Made by (company or person)</label><input id="f-maker" name="maker" type="text" maxLength={120} /></div>
        </div>
        {kind === 'app' && (
          <div className="ad-f"><label htmlFor="f-cat">Category</label>
            <select id="f-cat" name="category" defaultValue="">
              <option value="" disabled>Choose one</option>
              {CATEGORIES.filter(c => c.key !== 'websites').map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select><E k="category" /></div>
        )}
        <div className="ad-f"><span className="ad-f-label">Who is it for?</span>
          <div className="ad-checks">
            {AGE_GROUPS.map(a => (
              <label key={a.key}><input type="checkbox" checked={ages.includes(a.key)} onChange={e => setAges(s => e.target.checked ? [...s, a.key] : s.filter(x => x !== a.key))} />{a.label}</label>
            ))}
          </div><E k="ageGroups" /></div>
        <div className="ad-f"><label htmlFor="f-ages">Age range, in your words <small>(optional, e.g. 4 to 8)</small></label><input id="f-ages" name="ages" type="text" maxLength={60} /></div>
        <div className="ad-two">
          <div className="ad-f"><label htmlFor="f-pm">Pricing</label>
            <select id="f-pm" name="priceModel" defaultValue="">
              <option value="" disabled>Choose one</option>
              {Object.entries(PRICE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select><E k="priceModel" /></div>
          <div className="ad-f"><label htmlFor="f-price">Prices <small>(optional, e.g. $4.99/mo)</small></label><input id="f-price" name="price" type="text" maxLength={160} /></div>
        </div>
        {kind === 'app' && <>
          <div className="ad-f"><label htmlFor="f-ios">App Store link</label><input id="f-ios" name="iosUrl" type="url" placeholder="https://apps.apple.com/..." /><E k="iosUrl" /></div>
          <div className="ad-f"><label htmlFor="f-and">Google Play link</label><input id="f-and" name="androidUrl" type="url" placeholder="https://play.google.com/..." /><E k="androidUrl" /></div>
        </>}
        <div className="ad-f"><label htmlFor="f-web">Website {kind === 'app' && <small>(optional)</small>}</label><input id="f-web" name="webUrl" type="url" placeholder="https://" /><E k="webUrl" /></div>
        <div className="ad-f"><label htmlFor="f-desc">Describe it for parents</label>
          <textarea id="f-desc" name="description" maxLength={900} placeholder="What it does, who it's for, and what makes it different. Plain words work best." />
          <small>60 to 900 characters. If approved, this becomes the description on its page.</small><E k="description" /></div>
      </fieldset>

      <fieldset>
        <legend>About you</legend>
        <div className="ad-two">
          <div className="ad-f"><label htmlFor="f-cn">Your name</label><input id="f-cn" name="contactName" type="text" maxLength={120} /><E k="contactName" /></div>
          <div className="ad-f"><label htmlFor="f-ce">Email</label><input id="f-ce" name="contactEmail" type="email" maxLength={254} /><E k="contactEmail" /></div>
        </div>
        <div className="ad-f"><label htmlFor="f-role">Your connection to it</label>
          <select id="f-role" name="contactRole" defaultValue="">
            <option value="" disabled>Choose one</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select><E k="contactRole" /></div>
        <div className="ad-f"><label htmlFor="f-notes">Anything else we should know? <small>(optional)</small></label><textarea id="f-notes" name="notes" maxLength={1000} style={{ minHeight: 80 }} /></div>
        <div className="ad-hp" aria-hidden="true"><label>Company site<input name="company_site" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="ad-f"><label style={{ fontWeight: 600, display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
          <input type="checkbox" name="confirm" style={{ marginTop: '.3rem' }} />
          <span>The details above are accurate, and I understand every submission is reviewed by the Faithful Kids team and listings are approved at their discretion.</span>
        </label><E k="confirm" /></div>
      </fieldset>
      <button className="ad-btn" type="submit" disabled={busy}>{busy ? 'Sending...' : `Submit the ${kind}`}</button>
    </form>
  )
}
