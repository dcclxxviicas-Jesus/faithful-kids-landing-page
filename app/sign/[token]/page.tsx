import type { Metadata } from 'next'
import './sign.css'
import { getByToken, patchContract } from '@/lib/contracts'
import { SignForm } from './SignForm'

export const dynamic = 'force-dynamic'

// Never indexed, and robots.txt disallows /sign/ as well. A contract carrying
// someone's name and fee must not end up in a search result.
export const metadata: Metadata = {
  title: 'Agreement — Faithful Kids',
  robots: { index: false, follow: false, nocache: true },
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sg">
      <div className="sg-bar">
        <div className="sg-bar-in">
          <img src="/logo-sm.png" alt="" /> Faithful Kids
        </div>
      </div>
      <div className="sg-wrap">
        {children}
        <p className="sg-foot">
          Sent by Christian Alexander, Faithful Kids.<br />
          Questions, or want something changed? Email{' '}
          <a href="mailto:christian@faithfulkids.app">christian@faithfulkids.app</a> — it comes
          straight to me.
        </p>
      </div>
    </div>
  )
}

function Gate({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <div className="sg-gate">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </Shell>
  )
}

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        dateStyle: 'long', timeStyle: 'short', timeZone: 'America/New_York',
      }) + ' ET'
    : '—'

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const row = await getByToken(token)

  if (!row) {
    return <Gate
      title="This link isn't valid"
      body="We couldn't find an agreement for this link. It may have been typed incorrectly, or replaced by a newer one. Email christian@faithfulkids.app and I'll send a fresh link." />
  }
  if (row.status === 'voided') {
    return <Gate
      title="This agreement was withdrawn"
      body="This version is no longer open for signature. If we're still working together, a replacement is on its way — email christian@faithfulkids.app if you haven't had it." />
  }
  if (row.status !== 'signed' && new Date(row.expires_at) < new Date()) {
    return <Gate
      title="This link has expired"
      body="Signing links are open for 30 days. Nothing is lost — email christian@faithfulkids.app and I'll send a new one with the same terms." />
  }

  // Idempotent: only the first view is recorded, so this is safe however many
  // times the server renders the page.
  if (!row.first_viewed_at && row.status === 'sent') {
    await patchContract(row.id, { first_viewed_at: new Date().toISOString(), status: 'viewed' })
  }

  const signed = row.status === 'signed'

  return (
    <Shell>
      {signed ? (
        <div className="sg-done">
          <h3>Signed and complete</h3>
          <p>
            Thank you. This agreement was executed on {fmt(row.signed_at)} and a copy has been
            emailed to you. You can come back to this page at any time.
          </p>
        </div>
      ) : (
        <div className="sg-intro">
          <strong>{row.signer_name}</strong> — here is the agreement for the work we discussed,
          in full. Read it, and if you&apos;re happy, sign at the bottom. It takes one click.
          I&apos;ve already signed it on our side. If you want anything changed, reply to my email
          rather than signing and I&apos;ll send a revised version.
        </div>
      )}

      <article className="sg-doc" dangerouslySetInnerHTML={{ __html: row.body_html }} />

      {!signed && <SignForm token={row.token} signerName={row.signer_name} />}

      {signed && (
        <div className="sg-audit">
          <h4>Signature record</h4>
          <dl>
            <dt>Signed by</dt><dd>{row.signer_typed_name}</dd>
            <dt>Email</dt><dd>{row.signer_email}</dd>
            <dt>Signed at</dt><dd>{fmt(row.signed_at)}</dd>
            <dt>Sent at</dt><dd>{fmt(row.sent_at)}</dd>
            <dt>First opened</dt><dd>{fmt(row.first_viewed_at)}</dd>
            <dt>IP address</dt><dd>{row.signer_ip || '—'}</dd>
            <dt>Consent</dt><dd>{row.consent_electronic ? 'Agreed to sign electronically' : '—'}</dd>
            <dt>Document</dt><dd>SHA-256 {row.body_sha256}</dd>
          </dl>
        </div>
      )}
    </Shell>
  )
}
