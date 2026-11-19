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

export function PayoutEmailForm({ token, current }: { token: string; current: string | null }) {
  const [value, setValue] = useState(current || '')
  const [state, setState] = useState<'' | 'busy' | 'saved' | string>('')
  return (
    <form className="af-payout" onSubmit={async e => {
      e.preventDefault(); setState('busy')
      try {
        const res = await fetch('/api/affiliates/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, payoutEmail: value }) })
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
