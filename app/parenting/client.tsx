'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'

function track(event: string, props: Record<string, unknown>) {
  try { posthog.capture(event, props) } catch { /* analytics must never break the page */ }
}

/* ------------------------------------------------------------ share row */

export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent
  const items = [
    { k: 'x', label: 'X', href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { k: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { k: 'pinterest', label: 'Pinterest', href: `https://pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(title)}` },
    { k: 'email', label: 'Email', href: `mailto:?subject=${enc(title)}&body=${enc(url)}` },
  ]
  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      track('parenting_share', { channel: 'copy', url })
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked: nothing to do */ }
  }
  return (
    <div className="pt-share" aria-label="Share this article">
      <span className="lbl">Share</span>
      {items.map(i => (
        <a key={i.k} href={i.href} target={i.k === 'email' ? undefined : '_blank'} rel="noopener"
           onClick={() => track('parenting_share', { channel: i.k, url })}>{i.label}</a>
      ))}
      <button type="button" onClick={copy} className={copied ? 'copied' : undefined}>{copied ? 'Link copied' : 'Copy link'}</button>
    </div>
  )
}

/* ------------------------------------------------------------ newsletter */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function NewsletterCard({ source, compact = false }: { source: string; compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const seen = useRef(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = box.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(es => {
      if (seen.current || !es.some(e => e.isIntersecting)) return
      seen.current = true
      track('parenting_newsletter_shown', { source })
      io.disconnect()
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [source])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = email.trim().toLowerCase()
    if (!EMAIL_RE.test(v)) { setState('error'); setMsg('Please enter a valid email address.'); return }
    setState('sending'); setMsg('')
    try {
      const res = await fetch('/api/parenting/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, source, path: typeof location !== 'undefined' ? location.pathname : '' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setState('done')
      track('parenting_newsletter_submitted', { source })
    } catch (err) {
      setState('error')
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="pt-news-card" ref={box}>
      {!compact && <p className="pt-kicker">Faithful Kids Weekly</p>}
      <h3>Thoughtful stories for the journey of parenthood.</h3>
      <p>
        One email a week: a parent story worth your time, one practical family activity, one thing worth
        knowing, and one Bible lesson to explore with your kids.
      </p>
      {state === 'done' ? (
        <div className="pt-news-ok" role="status">
          Check your inbox. We sent a confirmation link; the newsletter starts once you click it.
        </div>
      ) : (
        <form className="pt-news-form" onSubmit={submit} noValidate>
          <label htmlFor={`pt-news-${source}`} className="pt-hp">Email address</label>
          <input id={`pt-news-${source}`} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
                 value={email} onChange={e => setEmail(e.target.value)} required aria-invalid={state === 'error'} />
          <button className="pt-btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Subscribe'}</button>
        </form>
      )}
      {state === 'error' && <p className="pt-news-err" role="alert">{msg}</p>}
      <p className="pt-news-fine">
        Adults only. We confirm by email before sending anything, never share your address, and every email
        has a one-click unsubscribe. <a href="/privacy">Privacy</a>.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------ pitch form */

type Field = 'name' | 'email' | 'role' | 'topic' | 'pitch' | 'experience' | 'url' | 'adult' | 'terms'

const ROLES = [
  'Parent', 'Homeschool parent', 'Sunday school teacher', "Children's ministry director", 'Pastor',
  'Christian educator', 'Writer or creator', 'Researcher', 'Other',
]

export function PitchForm() {
  const [v, setV] = useState({ name: '', email: '', role: '', topic: '', pitch: '', experience: '', url: '', interview: false, adult: false, terms: false, website: '' })
  const [errs, setErrs] = useState<Partial<Record<Field, string>>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [serverMsg, setServerMsg] = useState('')
  const started = useRef<number>(0)
  useEffect(() => { started.current = Date.now() }, [])

  function set<K extends keyof typeof v>(k: K, val: (typeof v)[K]) {
    setV(s => ({ ...s, [k]: val }))
    if (errs[k as Field]) setErrs(e => ({ ...e, [k]: undefined }))
  }

  function validate(): Partial<Record<Field, string>> {
    const e: Partial<Record<Field, string>> = {}
    if (v.name.trim().length < 2) e.name = 'Please tell us your name.'
    if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.'
    if (!v.role) e.role = 'Choose the option that fits best.'
    if (v.topic.trim().length < 5) e.topic = 'Give your idea a working title.'
    if (v.pitch.trim().length < 60) e.pitch = 'A few sentences, please (at least 60 characters).'
    if (v.pitch.length > 2000) e.pitch = 'Please keep the pitch under 2,000 characters.'
    if (v.experience.length > 1500) e.experience = 'Please keep this under 1,500 characters.'
    if (v.url && !/^https?:\/\/\S+\.\S+/.test(v.url.trim())) e.url = 'Links should start with http:// or https://'
    if (!v.adult) e.adult = 'Contributors must be 18 or older.'
    if (!v.terms) e.terms = 'Please read and accept the submission terms.'
    setErrs(e)
    return e
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    const firstBad = (Object.keys(e) as Field[])[0]
    if (firstBad) {
      // Focus by id, not by the error class: state has not re-rendered yet
      // when this runs, so the class is not in the DOM.
      const el = document.getElementById(`pf-${firstBad}`) || document.querySelector<HTMLElement>(`#pitch-form input[type=checkbox]`)
      el?.focus()
      return
    }
    setState('sending'); setServerMsg('')
    try {
      const res = await fetch('/api/parenting/pitch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, elapsedMs: Date.now() - started.current }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setState('done')
      track('parenting_pitch_submitted', { role: v.role })
    } catch (err) {
      setState('error')
      setServerMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (state === 'done') {
    return (
      <div className="pt-form-ok" role="status">
        <h3>Thank you. We have your pitch.</h3>
        <p>A confirmation is on its way to <strong>{v.email.trim()}</strong>. An editor reads every submission personally and replies within about a week, whether or not the answer is yes.</p>
        <p>In the meantime, you might like to read <a href="/parenting/editorial-policy">how we edit</a>.</p>
      </div>
    )
  }

  /* A plain render helper, NOT a component: a component defined inside the
     render function is a new type on every keystroke, which remounts the
     input and drops focus after each character. */
  const F = ({ k, label, hint, children, optional }: { k: Field; label: string; hint?: string; children: React.ReactNode; optional?: boolean }) => (
    <div className={`pt-field${errs[k] ? ' has-error' : ''}`} key={k}>
      <label htmlFor={`pf-${k}`}>{label} {optional && <small>(optional)</small>}</label>
      {children}
      {errs[k] ? <p className="err" id={`pf-${k}-err`} role="alert">{errs[k]}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  )

  return (
    <form className="pt-form" onSubmit={submit} noValidate id="pitch-form">
      <div className="row">
        {F({ k: "name", label: "Your name", children: (<>
          <input id="pf-name" value={v.name} onChange={e => set('name', e.target.value)} autoComplete="name" maxLength={120} aria-describedby={errs.name ? 'pf-name-err' : undefined} />
        </>) })}
        {F({ k: "email", label: "Email address", hint: "Only used to reply to you about this pitch.", children: (<>
          <input id="pf-email" type="email" inputMode="email" value={v.email} onChange={e => set('email', e.target.value)} autoComplete="email" maxLength={254} />
        </>) })}
      </div>
      {F({ k: "role", label: "Which best describes you?", children: (<>
        <select id="pf-role" value={v.role} onChange={e => set('role', e.target.value)}>
          <option value="">Choose one</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </>) })}
      {F({ k: "topic", label: "Working title or topic", children: (<>
        <input id="pf-topic" value={v.topic} onChange={e => set('topic', e.target.value)} maxLength={160} placeholder="What I learned reading the Bible with my kids every night" />
      </>) })}
      {F({ k: "pitch", label: "Tell us the story in a few sentences", hint: "What happened, why it matters to another family, and what you would want them to take from it.", children: (<>
        <textarea id="pf-pitch" value={v.pitch} onChange={e => set('pitch', e.target.value)} maxLength={2000} />
        <span className="count">{v.pitch.length}/2000</span>
      </>) })}
      {F({ k: "experience", label: "Relevant experience", hint: "Your role, how long you have done it, anything that helps us understand your vantage point.", optional: true, children: (<>
        <textarea id="pf-experience" value={v.experience} onChange={e => set('experience', e.target.value)} maxLength={1500} style={{ minHeight: 90 }} />
      </>) })}
      {F({ k: "url", label: "Writing sample, website, or profile", optional: true, children: (<>
        <input id="pf-url" type="url" inputMode="url" value={v.url} onChange={e => set('url', e.target.value)} maxLength={300} placeholder="https://" />
      </>) })}

      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="pt-hp" aria-hidden="true">
        <label htmlFor="pf-website">Website</label>
        <input id="pf-website" tabIndex={-1} autoComplete="off" value={v.website} onChange={e => set('website', e.target.value)} />
      </div>

      <div className="pt-field">
        <label className="pt-check">
          <input type="checkbox" checked={v.interview} onChange={e => set('interview', e.target.checked)} />
          <span><strong>I&rsquo;d rather be interviewed than write it myself.</strong> An editor will call, draft the piece in my voice, and send it to me to approve.</span>
        </label>
      </div>
      <div className={`pt-field${errs.adult ? ' has-error' : ''}`}>
        <label className="pt-check">
          <input type="checkbox" checked={v.adult} onChange={e => set('adult', e.target.checked)} />
          <span>I am 18 or older.</span>
        </label>
        {errs.adult && <p className="err" role="alert">{errs.adult}</p>}
      </div>
      <div className={`pt-field${errs.terms ? ' has-error' : ''}`}>
        <label className="pt-check">
          <input type="checkbox" checked={v.terms} onChange={e => set('terms', e.target.checked)} />
          <span>
            I have read the <a href="/parenting/submission-guidelines" target="_blank" rel="noopener">submission guidelines</a> and
            the <a href="/privacy" target="_blank" rel="noopener">privacy policy</a>. This pitch is my own work, and I understand that
            sending it does not guarantee publication or transfer any rights.
          </span>
        </label>
        {errs.terms && <p className="err" role="alert">{errs.terms}</p>}
      </div>

      {state === 'error' && <div className="pt-form-err" role="alert">{serverMsg}</div>}

      <div>
        <button className="pt-btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send my pitch'}
        </button>
      </div>
    </form>
  )
}
