import { createHmac, timingSafeEqual } from 'crypto'
import { adminPassword } from './admin-stats'

/*
 * Admin session for the Parenting desk.
 *
 * The existing admin pattern sends the password in an `x-admin-password`
 * header on every API call. That works for fetch() from a client component,
 * but a server-rendered preview page needs something the browser sends on a
 * plain navigation, so the desk also sets an httpOnly cookie: an HMAC of the
 * admin password keyed by DRIP_SECRET. Rotating either secret invalidates
 * every session. No password ever travels in a query string.
 */

export const ADMIN_COOKIE = 'fk_admin'
const MAX_AGE_S = 12 * 3600

function secret(): string {
  return process.env.DRIP_SECRET || process.env.CRON_SECRET || ''
}

export async function passwordOk(pw: string | null | undefined): Promise<boolean> {
  const expected = await adminPassword()
  if (!expected || !pw) return false
  const a = Buffer.from(pw)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function adminCookieValue(): Promise<string> {
  const expected = await adminPassword()
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S
  const sig = createHmac('sha256', secret()).update(`${expected}:${exp}`).digest('hex')
  return `${exp}.${sig}`
}

export async function hasAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value || !secret()) return false
  const [expStr, sig] = value.split('.')
  const exp = Number(expStr)
  if (!exp || !sig || exp < Math.floor(Date.now() / 1000)) return false
  const expected = await adminPassword()
  if (!expected) return false
  const want = createHmac('sha256', secret()).update(`${expected}:${exp}`).digest('hex')
  try {
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(want, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function cookieHeader(value: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${ADMIN_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_S}${secure}`
}

export function clearCookieHeader(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}
