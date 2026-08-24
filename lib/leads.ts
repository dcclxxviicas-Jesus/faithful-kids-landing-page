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
  magnet: 'challenge' | 'trivia-pack' | 'bedtime-kit'
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

export async function getDueLeads(limit = 50): Promise<Lead[]> {
  const now = new Date().toISOString()
  const res = await supa(
    `/leads?unsubscribed=eq.false&sequence_stage=lt.5&sequence_stage=gt.0&next_send_at=lte.${encodeURIComponent(now)}&order=next_send_at.asc&limit=${limit}`
  )
  if (!res.ok) throw new Error(`due leads query failed: ${res.status}`)
  return res.json()
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
  from?: string
): Promise<boolean> {
  if (!RESEND_KEY) throw new Error('RESEND_API_KEY missing')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Cold lead nurture sends as the brand; trial and customer mail sends
      // as Christian, because those emails ask for a reply and a person has
      // to be on the other end of it.
      from: from || `Faithful Kids <${FROM_EMAIL}>`,
      to: [to],
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
