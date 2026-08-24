import { NextRequest, NextResponse } from 'next/server'
import { cfg, adminPassword } from '@/lib/admin-stats'
import { sendLeadEmail } from '@/lib/leads'
import { buildTrialEmail, TRIAL_FROM, type TrialContext, type TrialEmailType } from '@/lib/trial-emails'

export const maxDuration = 120

// Trial lifecycle emails. Runs daily via Vercel Cron.
//   ?dry=1     -> report what WOULD send, send nothing (safe to run anytime)
//   ?preview=1 -> render every template against live trial data as HTML
// Dedupe is email_log (family_id + email_type), so a given family can only
// ever receive each trial email once, no matter how often this runs.

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY

async function supa(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY || '',
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

interface StripeSub {
  id: string
  status: string
  customer: string
  created: number
  trial_end: number | null
  cancel_at_period_end: boolean
  items: { data: { price: { unit_amount: number; recurring?: { interval: string } } }[] }
}

async function stripeGet(path: string): Promise<Record<string, unknown>> {
  const key = await cfg('STRIPE_READONLY_KEY')
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`Stripe ${res.status}`)
  return res.json()
}

function priceLabel(sub: StripeSub): string {
  const p = sub.items.data[0]?.price
  if (!p) return 'your plan price'
  const amount = (p.unit_amount / 100).toFixed(2).replace(/\.00$/, '')
  return `$${amount}/${p.recurring?.interval === 'year' ? 'year' : 'month'}`
}

function dayLabel(ts: number | null): string {
  if (!ts) return 'soon'
  const d = new Date(ts * 1000)
  const days = (d.getTime() - Date.now()) / 86400_000
  if (days < 1) return 'tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' })
}

function firstNameOf(name: string | null | undefined, email: string): string | null {
  const n = (name || '').trim()
  if (n) return n.split(/\s+/)[0]
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  // Only use the address as a name when it actually looks like one
  if (/^[a-z]+$/i.test(local) && local.length > 2 && local.length < 15) {
    return local.charAt(0).toUpperCase() + local.slice(1)
  }
  return null
}

interface Candidate {
  familyId: string
  ctx: TrialContext
  type: TrialEmailType
  reason: string
}

// Work out who is due which email right now.
async function findCandidates(): Promise<Candidate[]> {
  const subs = (
    (await stripeGet('subscriptions?status=all&limit=100')) as { data: StripeSub[] }
  ).data

  const now = Date.now()
  const out: Candidate[] = []

  for (const sub of subs) {
    const hadTrial = !!sub.trial_end
    if (!hadTrial) continue

    const trialEndMs = (sub.trial_end || 0) * 1000
    const ageDays = (now - sub.created * 1000) / 86400_000

    // Which email does this subscription's state call for?
    let type: TrialEmailType | null = null
    let reason = ''
    if (sub.status === 'trialing' && sub.cancel_at_period_end) {
      type = 'trial_canceling'
      reason = 'set to cancel during trial'
    } else if (sub.status === 'trialing' && ageDays >= 1 && ageDays < 2) {
      type = 'trial_day1'
      reason = 'day 1 of trial'
    } else if (sub.status === 'trialing' && ageDays >= 2 && now < trialEndMs) {
      type = 'trial_day2'
      reason = 'day 2 — trial ends soon'
    } else if (sub.status === 'active' && trialEndMs && now > trialEndMs && now - trialEndMs < 3 * 86400_000) {
      type = 'trial_converted'
      reason = 'trial converted to paid'
    } else if (
      (sub.status === 'canceled' || sub.status === 'incomplete_expired') &&
      trialEndMs &&
      now > trialEndMs &&
      now - trialEndMs < 3 * 86400_000
    ) {
      type = 'trial_canceled'
      reason = 'trial ended without converting'
    }
    if (!type) continue

    // Family for this Stripe customer
    const famRes = await supa(
      `/families?select=id,parent_email,parent_name,email_notifications&stripe_customer_id=eq.${sub.customer}`
    )
    const fams = famRes.ok ? await famRes.json() : []
    const fam = fams[0]
    if (!fam?.parent_email) continue

    // Never send the same trial email to the same family twice
    const logRes = await supa(
      `/email_log?select=id&family_id=eq.${fam.id}&email_type=eq.${type}&limit=1`
    )
    const already = logRes.ok ? await logRes.json() : []
    if (already.length) continue

    // Engagement state
    const kidsRes = await supa(`/kids?select=id,name&family_id=eq.${fam.id}`)
    const kids = kidsRes.ok ? await kidsRes.json() : []
    const kidIds = (kids as { id: string }[]).map((k) => k.id)

    let episodesWatched = 0
    let lastSeriesName: string | null = null
    if (kidIds.length) {
      const progRes = await supa(
        `/episode_progress?select=series_slug,watched,updated_at&kid_id=in.(${kidIds.join(',')})&watched=is.true&order=updated_at.desc`
      )
      const prog = progRes.ok ? await progRes.json() : []
      episodesWatched = (prog as unknown[]).length
      const slug = (prog as { series_slug?: string }[])[0]?.series_slug
      if (slug) {
        lastSeriesName = slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      }
    }

    out.push({
      familyId: fam.id,
      type,
      reason,
      ctx: {
        email: fam.parent_email,
        firstName: firstNameOf(fam.parent_name, fam.parent_email),
        kidNames: (kids as { name: string }[]).map((k) => k.name).filter(Boolean),
        episodesWatched,
        lastSeriesName,
        priceLabel: priceLabel(sub),
        trialEndsLabel: dayLabel(sub.trial_end),
      },
    })
  }
  return out
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const pw = req.nextUrl.searchParams.get('password') || ''
  const expected = await adminPassword()
  const cronOk =
    req.headers.get('user-agent')?.startsWith('vercel-cron/') ||
    (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`)
  if (!cronOk && !(expected && pw === expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dry = req.nextUrl.searchParams.get('dry') === '1'
  const preview = req.nextUrl.searchParams.get('preview') === '1'

  try {
    const candidates = await findCandidates()

    if (preview) {
      const blocks = candidates.map((c) => {
        const { subject, html } = buildTrialEmail(c.ctx, c.type)
        return `<h2 style="font:600 15px system-ui;margin:28px 0 6px">${c.type} → ${c.ctx.email} <span style="color:#888;font-weight:400">(${c.reason})</span></h2>
<p style="font:600 14px system-ui;margin:0 0 8px">Subject: ${subject}</p>
<iframe style="width:600px;height:640px;border:1px solid #ddd;border-radius:8px" srcdoc="${html.replace(/"/g, '&quot;')}"></iframe>`
      })
      return new NextResponse(
        `<body style="font-family:system-ui;padding:24px">${blocks.join('') || '<p>No trial emails are due right now.</p>'}</body>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    const results: Record<string, string>[] = []
    for (const c of candidates) {
      const { subject, html } = buildTrialEmail(c.ctx, c.type)
      if (dry) {
        results.push({ email: c.ctx.email, type: c.type, reason: c.reason, subject, sent: 'DRY RUN' })
        continue
      }
      const ok = await sendLeadEmail(c.ctx.email, subject, html, TRIAL_FROM)
      if (ok) {
        await supa('/email_log', {
          method: 'POST',
          body: JSON.stringify({
            family_id: c.familyId,
            email_type: c.type,
            sent_to: c.ctx.email,
          }),
        })
      }
      results.push({ email: c.ctx.email, type: c.type, reason: c.reason, sent: ok ? 'yes' : 'FAILED' })
    }

    return NextResponse.json({ ok: true, dry, due: candidates.length, results })
  } catch (err) {
    console.error('trial-emails error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'failed' },
      { status: 500 }
    )
  }
}
