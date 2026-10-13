import { NextRequest, NextResponse } from 'next/server'
import { adminPassword } from '@/lib/admin-stats'
import {
  listTemplates, getTemplate, render, sha256, newToken,
  insertContract, listContracts, patchContract, getByToken, sendMail,
  SITE_URL, type Vars,
} from '@/lib/contracts'

export const dynamic = 'force-dynamic'

async function authed(req: NextRequest): Promise<boolean> {
  const pw = req.headers.get('x-admin-password') || ''
  const expected = await adminPassword()
  return !!expected && pw === expected
}

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

/* Templates + every contract, for the dashboard. body_html is dropped here:
   300 frozen contracts is a payload nobody needs just to see a list. */
export async function GET(req: NextRequest) {
  if (!await authed(req)) return unauthorized()
  const rows = (await listContracts()).map(r => ({ ...r, body_html: undefined }))
  return NextResponse.json({ templates: listTemplates(), contracts: rows })
}

export async function POST(req: NextRequest) {
  if (!await authed(req)) return unauthorized()

  let body: {
    action?: string
    template?: string
    vars?: Vars
    sendEmail?: boolean
    id?: string
    reason?: string
    token?: string
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }

  /* Render without saving, so nothing is ever sent unread. */
  if (body.action === 'preview') {
    const tpl = getTemplate(body.template || '')
    return NextResponse.json({ html: render(tpl, body.vars || {}, new Date()) })
  }

  if (body.action === 'void') {
    const row = await patchContract(body.id || '', {
      status: 'voided',
      voided_at: new Date().toISOString(),
      void_reason: body.reason || null,
    })
    // The database refuses to modify an executed contract, so a null here on
    // a signed row is the trigger doing its job, not a bug.
    if (!row) return NextResponse.json({ error: 'Could not void. Signed contracts are immutable.' }, { status: 409 })
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'create') {
    const tpl = getTemplate(body.template || '')
    const vars = body.vars || {}

    for (const f of tpl.fields) {
      if (f.required && !String(vars[f.key] || '').trim()) {
        return NextResponse.json({ error: `Missing required field: ${f.label}` }, { status: 400 })
      }
    }

    const sentAt = new Date()
    const html = render(tpl, vars, sentAt)
    const token = newToken()
    const expires = new Date(sentAt.getTime() + 30 * 24 * 3600 * 1000)

    const row = await insertContract({
      token,
      template: tpl.id,
      template_version: tpl.version,
      talent_name: vars.talent_name,
      talent_handle: vars.talent_handle || null,
      signer_name: vars.signer_name || vars.talent_name,
      signer_email: (vars.signer_email || '').toLowerCase().trim(),
      signer_capacity: vars.signer_capacity || null,
      payee_name: vars.payee_name || null,
      vars,
      body_html: html,
      body_sha256: sha256(html),
      status: 'sent',
      sent_at: sentAt.toISOString(),
      expires_at: expires.toISOString(),
    })

    const link = `${SITE_URL}/sign/${token}`

    /* Sending from here is OPTIONAL and off by default. The outreach pool is
       cautious — people email to check an invitation is real before clicking
       anything — so the better move is almost always to paste this link as a
       reply inside the Gmail thread they are already corresponding in. A
       fresh transactional envelope is the one that gets treated as a scam. */
    if (body.sendEmail) {
      await sendMail(
        row.signer_email,
        `Our agreement — Faithful Kids`,
        `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#16314f;line-height:1.6;max-width:600px">
          <p>Hi,</p>
          <p>Here's the agreement for the work we discussed, in full. Have a read, and if you're
          happy with it you can sign at the bottom of the page. I've already signed on our side.</p>
          <p style="margin:24px 0"><a href="${link}" style="background:#16a34a;color:#fff;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:999px;display:inline-block">Read and sign the agreement</a></p>
          <p>If anything needs changing, just reply to this email instead of signing and I'll send
          a revised version. It comes straight to me.</p>
          <p>— Christian<br />Faithful Kids</p>
        </div>`
      )
    }

    return NextResponse.json({ ok: true, link, id: row.id, sha: row.body_sha256 })
  }

  /* Record a deal papered somewhere else — a creator who brought their own
     contract. Keeps the dashboard a complete register rather than a view of
     only the deals that happened to use this tool. */
  if (body.action === 'external') {
    const vars = body.vars || {}
    const now = new Date()
    await insertContract({
      token: newToken(),
      template: 'external',
      template_version: '0',
      talent_name: vars.talent_name,
      talent_handle: vars.talent_handle || null,
      signer_name: vars.signer_name || vars.talent_name,
      signer_email: (vars.signer_email || '').toLowerCase().trim(),
      payee_name: vars.payee_name || null,
      vars,
      body_html: '<p>Signed on the counterparty&rsquo;s own paper. Not stored here.</p>',
      body_sha256: 'external',
      status: 'signed',
      sent_at: now.toISOString(),
      signed_at: now.toISOString(),
      expires_at: now.toISOString(),
      external: true,
      external_note: body.reason || null,
    })
    return NextResponse.json({ ok: true })
  }

  /* Re-fetch one contract's link, e.g. to paste it again. */
  if (body.action === 'link') {
    const row = await getByToken(body.token || '')
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ link: `${SITE_URL}/sign/${row.token}` })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
