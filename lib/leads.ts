import { createHmac, timingSafeEqual } from 'crypto'

// Server-side helpers for the email-capture lead system.
// Talks to Supabase via PostgREST and Resend via REST — no SDK deps.

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'team@faithfulkids.app'
const DRIP_SECRET = process.env.DRIP_SECRET || ''

export const SITE_URL = 'https://faithfulkids.app'

export interface Lead {
  id: string
  email: string
  magnet: 'challenge' | 'trivia-pack' | 'bedtime-kit' | 'coloring-pages' | 'quiz-plan'
  source: string
  source_post: string | null
  quiz_answers: Record<string, string> | null
  sequence_stage: number
  next_send_at: string | null
  unsubscribed: boolean
}

async function supa(path: string, init: RequestInit = {}): Promise<Response> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env missing')
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

export async function upsertLead(fields: {
  email: string
  magnet: string
  source: string
  source_post?: string | null
  quiz_answers?: Record<string, string> | null
}): Promise<{ created: boolean }> {
  // Insert; on conflict (repeat subscriber) do nothing so their drip state
  // and original attribution are preserved.
  const res = await supa('/leads?on_conflict=email', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify([{
      email: fields.email.toLowerCase().trim(),
      magnet: fields.magnet,
      source: fields.source,
      source_post: fields.source_post || null,
      quiz_answers: fields.quiz_answers || null,
      sequence_stage: 0,
    }]),
  })
  if (!res.ok) throw new Error(`lead upsert failed: ${res.status} ${await res.text()}`)
  const rows = await res.json()
  return { created: Array.isArray(rows) && rows.length > 0 }
}

export async function getLeadByEmail(email: string): Promise<Lead | null> {
  const res = await supa(`/leads?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&limit=1`)
  if (!res.ok) return null
  const rows = await res.json()
  return rows[0] || null
}

export async function updateLead(email: string, patch: Record<string, unknown>): Promise<void> {
  const res = await supa(`/leads?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error(`lead update failed: ${res.status}`)
}

/* A lead who has since become a customer must leave the nurture drip: it
   exists to sell a trial they already have. families.subscription_status is
   kept current by both the Stripe and RevenueCat webhooks, so one lookup
   covers web, Apple and Google buyers (and gifted church accounts, which
   have the product too). Throws on a failed lookup so the caller decides. */
export async function customerStatus(email: string): Promise<string | null> {
  const res = await supa(
    `/families?parent_email=ilike.${encodeURIComponent(email.toLowerCase().trim())}&subscription_status=in.(active,trialing,past_due)&select=subscription_status&limit=1`
  )
  if (!res.ok) throw new Error(`customer lookup failed: ${res.status}`)
  const rows = await res.json()
  return rows[0]?.subscription_status || null
}

export async function getDueLeads(limit = 50): Promise<Lead[]> {
  const now = new Date().toISOString()
  const res = await supa(
    `/leads?unsubscribed=eq.false&sequence_stage=lt.5&sequence_stage=gt.0&next_send_at=lte.${encodeURIComponent(now)}&order=next_send_at.asc&limit=${limit}`
  )
  if (!res.ok) throw new Error(`due leads query failed: ${res.status}`)
  return res.json()
}

/* Unsubscribing must also reach the customer side. Trial and customer tips
   carry this same link, and until Nov 2026 clicking it only touched the leads
   table, so a customer who unsubscribed kept getting mail. This writes the
   app's own "all off" preference shape (bible-kids src/lib/email-prefs.ts) to
   every family using the address. Billing email is not affected. */
export const FAMILY_EMAILS_OFF = {
  episode_complete: false, series_complete: false, streak_milestone: false,
  weekly_digest: false, inactivity_reminder: false, v: 2,
}

export async function unsubscribeFamilies(email: string): Promise<void> {
  const res = await supa(`/families?parent_email=ilike.${encodeURIComponent(email.toLowerCase().trim())}`, {
    method: 'PATCH',
    body: JSON.stringify({ email_notifications: FAMILY_EMAILS_OFF }),
  })
  if (!res.ok) throw new Error(`family unsubscribe failed: ${res.status}`)
}

/** True when a family has switched every optional email off. */
export function familyUnsubscribed(prefs: unknown): boolean {
  const p = (prefs && typeof prefs === 'object' ? prefs : {}) as Record<string, unknown>
  return p.v === 2 && Object.keys(FAMILY_EMAILS_OFF).every((k) => k === 'v' || p[k] === false)
}

export function unsubscribeToken(email: string): string {
  return createHmac('sha256', DRIP_SECRET).update(email.toLowerCase().trim()).digest('hex')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    const expected = Buffer.from(unsubscribeToken(email), 'hex')
    const got = Buffer.from(token, 'hex')
    return expected.length === got.length && timingSafeEqual(expected, got)
  } catch {
    return false
  }
}

export function unsubscribeUrl(email: string): string {
  return `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email)}`
}

export async function sendLeadEmail(
  to: string,
  subject: string,
  html: string,
  from?: string,
  replyTo?: string
): Promise<boolean> {
  if (!RESEND_KEY) throw new Error('RESEND_API_KEY missing')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Everything sends as the brand. Trial and customer mail asks for a
      // reply, so callers pass the monitored inbox as replyTo.
      from: from || `Faithful Kids <${FROM_EMAIL}>`,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl(to)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  })
  return res.ok
}
