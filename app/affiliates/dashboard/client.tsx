'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button className="af-copy" type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000) } catch { /* noop */ }
    }}>{done ? 'Copied' : 'Copy link'}</button>
  )
}

export function PayoutEmailForm({ current }: { current: string | null }) {
  const [value, setValue] = useState(current || '')
  const [state, setState] = useState<'' | 'busy' | 'saved' | string>('')
  return (
    <form className="af-payout" onSubmit={async e => {
      e.preventDefault(); setState('busy')
      try {
        const res = await fetch('/api/affiliates/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payoutEmail: value }) })
        const j = await res.json().catch(() => ({}))
        setState(res.ok ? 'saved' : (j.error || 'Could not save.'))
      } catch { setState('Network error.') }
    }}>
      <input type="email" value={value} onChange={e => setValue(e.target.value)} placeholder="Your PayPal email" aria-label="PayPal email" />
      <button className="af-copy" type="submit" disabled={state === 'busy'}>{current ? 'Update' : 'Save'}</button>
      {state === 'saved' && <span className="af-ok">Saved.</span>}
      {state && state !== 'busy' && state !== 'saved' && <span className="af-err">{state}</span>}
    </form>
  )
}

export function LoginForm({ notice }: { notice: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'' | 'busy' | 'sent' | string>('')
  if (state === 'sent') return (
    <div className="af-done" role="status">
      <h3>Check your email</h3>
      <p>If {email} belongs to an approved affiliate, a sign-in link is on its way. It works for one hour.</p>
      <p>Nothing arriving? Check spam, or write to <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a>.</p>
    </div>
  )
  return (
    <form className="af-form" onSubmit={async e => {
      e.preventDefault(); setState('busy')
      try {
        const res = await fetch('/api/affiliates/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
        const j = await res.json().catch(() => ({}))
        setState(res.ok ? 'sent' : (j.error || 'Something went wrong.'))
      } catch { setState('Network error. Please try again.') }
    }}>
      {notice && <div className="af-formerr" role="alert">{notice}</div>}
      <div className="af-f"><label htmlFor="af-login">Email you applied with</label>
        <input id="af-login" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      {state && state !== 'busy' && <span className="af-err" style={{ marginBottom: 12 }}>{state}</span>}
      <button className="af-btn" type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending...' : 'Email me a sign-in link'}</button>
    </form>
  )
}
