'use client'

import { useState } from 'react'

/*
 * The signing act. Three things make this legally operative rather than
 * decorative, and none of them should be "tidied":
 *   1. an explicit consent to sign and be sent records electronically,
 *   2. the signer typing their own name (not a pre-filled value),
 *   3. a button that says what it does.
 * A pre-filled name is not a signature, and "Continue" is not intent to sign.
 */
export function SignForm({ token, signerName }: { token: string; signerName: string }) {
  const [typed, setTyped] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const ready = consent && typed.trim().length >= 3 && !busy

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/contracts/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, typedName: typed.trim(), consent: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please email christian@faithfulkids.app.')
        setBusy(false)
        return
      }
      // Reload rather than patching state: the server then renders the
      // executed view from the stored row, so what you see after signing is
      // read back from the record, not assembled in the browser.
      window.location.reload()
    } catch {
      setError('Could not reach the server. Please check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <form className="sg-sign" onSubmit={submit}>
      <h3>Sign this agreement</h3>
      <p className="sg-note">
        Please read the whole agreement above first. If anything needs changing, reply to the
        email instead of signing and we&apos;ll send a revised version.
      </p>

      <label className="sg-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
        />
        <span>
          I agree to sign this agreement electronically and to receive records about it
          electronically. I understand that my electronic signature has the same effect as a
          handwritten one.
        </span>
      </label>

      <div className="sg-field">
        <label htmlFor="typed">Type your full legal name to sign</label>
        <input
          id="typed"
          type="text"
          value={typed}
          autoComplete="name"
          placeholder={signerName}
          onChange={e => setTyped(e.target.value)}
        />
      </div>

      <button className="sg-btn" type="submit" disabled={!ready}>
        {busy ? 'Signing…' : 'I agree and sign'}
      </button>

      {error && <p className="sg-err">{error}</p>}
    </form>
  )
}
