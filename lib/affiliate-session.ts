import { createHmac, timingSafeEqual } from 'crypto'

/*
 * Affiliate sign-in, without passwords. Two kinds of signed value, both
 * HMAC'd with a key derived from DRIP_SECRET (already set in every
 * environment), so nothing new needs configuring:
 *   - a sign-in link token (1 hour), emailed from /affiliates/login
 *   - the session cookie (30 days) set by /affiliates/signin
 * The approval email links /affiliates/signin?k=<account token> instead,
 * which never expires but can be rotated from the desk.
 */

export const SESSION_COOKIE = 'fk_aff_session'
export const SESSION_DAYS = 30
const LINK_MINUTES = 60

function key(purpose: string): Buffer {
  const base = process.env.DRIP_SECRET || process.env.CAS_ADMIN_PASSWORD || ''
  if (!base) throw new Error('DRIP_SECRET missing')
  return createHmac('sha256', base).update(`fk-affiliate-${purpose}`).digest()
}

function sign(purpose: string, id: string, ttlMs: number): string {
  const exp = Date.now() + ttlMs
  const body = `${id}.${exp}`
  const mac = createHmac('sha256', key(purpose)).update(body).digest('base64url')
  return `${body}.${mac}`
}

function verify(purpose: string, value: string | undefined | null): string | null {
  if (!value) return null
  const parts = value.split('.')
  if (parts.length !== 3) return null
  const [id, exp, mac] = parts
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return null
  const want = createHmac('sha256', key(purpose)).update(`${id}.${exp}`).digest()
  let got: Buffer
  try { got = Buffer.from(mac, 'base64url') } catch { return null }
  return got.length === want.length && timingSafeEqual(got, want) ? id : null
}

export const signLink = (id: string) => sign('link', id, LINK_MINUTES * 60_000)
export const verifyLink = (v: string | null) => verify('link', v)
export const signSession = (id: string) => sign('session', id, SESSION_DAYS * 86400_000)
export const verifySession = (v: string | undefined | null) => verify('session', v)
