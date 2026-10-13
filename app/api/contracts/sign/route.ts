import { NextRequest, NextResponse } from 'next/server'
import { getByToken, patchContract, sendMail, SITE_URL } from '@/lib/contracts'

export const dynamic = 'force-dynamic'

/*
 * The signing endpoint.
 *
 * The most important thing it does is email the fully-executed contract, with
 * its SHA-256, to BOTH parties the moment it is signed. That copy then sits
 * in the signer's own inbox, timestamped by a mail provider neither side
 * controls — which is stronger contemporaneous evidence than anything in a
 * database we own. It is not a nicety; do not make it conditional.
 */

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') || ''
  return fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || ''
}

function executedEmail(opts: {
  heading: string
  intro: string
  bodyHtml: string
  typedName: string
  signedAt: string
  sha: string
  link: string
}) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#16314f;line-height:1.6;max-width:640px;margin:0 auto">
    <h2 style="font-size:1.3rem;margin:0 0 12px">${opts.heading}</h2>
    <p style="margin:0 0 16px">${opts.intro}</p>
    <div style="border:1px solid #e3ebf3;border-radius:12px;padding:20px 24px;background:#fff">
      ${opts.bodyHtml}
    </div>
    <div style="border:1px solid #e3ebf3;border-radius:12px;padding:16px 20px;margin-top:16px;background:#f7fdf9;font-size:13px;color:#3f5a77">
      <strong style="color:#16314f">Signature record</strong><br />
      Signed by: ${opts.typedName}<br />
      Signed at: ${opts.signedAt}<br />
      Document SHA-256: <span style="word-break:break-all">${opts.sha}</span><br />
      Permanent copy: <a href="${opts.link}" style="color:#15803d">${opts.link}</a>
    </div>
    <p style="margin:18px 0 0;font-size:13px;color:#3f5a77">
      Keep this email — it is your copy of the signed agreement.
    </p>
  </div>`
}

export async function POST(req: NextRequest) {
  let payload: { token?: string; typedName?: string; consent?: boolean }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const { token, typedName, consent } = payload
  if (!token || !typedName || typedName.trim().length < 3) {
    return NextResponse.json({ error: 'Please type your full legal name.' }, { status: 400 })
  }
  if (!consent) {
    return NextResponse.json({ error: 'Please tick the box to sign electronically.' }, { status: 400 })
  }

  const row = await getByToken(token)
  if (!row) return NextResponse.json({ error: 'This link is not valid.' }, { status: 404 })
  if (row.status === 'signed') {
    return NextResponse.json({ error: 'This agreement has already been signed.' }, { status: 409 })
  }
  if (row.status === 'voided') {
    return NextResponse.json({ error: 'This agreement was withdrawn.' }, { status: 409 })
  }
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired. Email christian@faithfulkids.app for a new one.' }, { status: 410 })
  }

  const signedAt = new Date()
  const updated = await patchContract(row.id, {
    status: 'signed',
    signed_at: signedAt.toISOString(),
    signer_typed_name: typedName.trim(),
    signer_ip: clientIp(req),
    signer_user_agent: (req.headers.get('user-agent') || '').slice(0, 400),
    consent_electronic: true,
  })
  if (!updated) {
    return NextResponse.json({ error: 'Could not record the signature. Please email christian@faithfulkids.app.' }, { status: 500 })
  }

  const link = `${SITE_URL}/sign/${row.token}`
  const when = signedAt.toLocaleString('en-US', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'America/New_York',
  }) + ' ET'

  // Both copies are sent before we return, so a signer never sees "signed"
  // without the record having left the building.
  await Promise.all([
    sendMail(
      row.signer_email,
      `Signed: ${row.talent_name} and Faithful Kids`,
      executedEmail({
        heading: 'Your signed agreement',
        intro: `Thank you — this is your copy of the agreement you signed on ${when}. Nothing else is needed from you right now.`,
        bodyHtml: row.body_html,
        typedName: typedName.trim(),
        signedAt: when,
        sha: row.body_sha256,
        link,
      })
    ),
    sendMail(
      'christian@faithfulkids.app',
      `Signed: ${row.talent_name}${row.signer_capacity ? ` (via ${row.signer_name})` : ''}`,
      executedEmail({
        heading: `${row.talent_name} signed`,
        intro: `Signed by ${typedName.trim()} (${row.signer_email}) on ${when}.`,
        bodyHtml: row.body_html,
        typedName: typedName.trim(),
        signedAt: when,
        sha: row.body_sha256,
        link,
      })
    ),
  ])

  return NextResponse.json({ ok: true })
}
