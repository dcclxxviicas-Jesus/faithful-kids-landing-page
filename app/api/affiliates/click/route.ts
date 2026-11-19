import { NextResponse } from 'next/server'
import { REF_COOKIE, TERMS, CODE_RE, affiliateByCode, recordClick, cookieDomain, dbConfigured } from '@/lib/affiliates'

export const dynamic = 'force-dynamic'

/*
 * Called once by the site (app/providers.tsx) when a page loads with
 * ?ref=<code>. Only an approved, active affiliate's code sets the cookie, so
 * a typo or a guessed code never takes credit. Last click wins: a new valid
 * code replaces the old one. The cookie is shared with app.faithfulkids.app,
 * whose checkout reads it too.
 */
export async function POST(req: Request) {
  let body: { code?: string; path?: string; referrer?: string }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const code = String(body.code || '').toLowerCase().trim()
  if (!CODE_RE.test(code) || !dbConfigured()) return NextResponse.json({ ok: false })

  const a = await affiliateByCode(code).catch(() => null)
  if (!a || a.status !== 'active') return NextResponse.json({ ok: false })

  let refHost: string | null = null
  try { refHost = body.referrer ? new URL(body.referrer).hostname.slice(0, 120) : null } catch { /* ignore */ }
  const path = String(body.path || '').slice(0, 300) || null
  await recordClick(a.id, path, refHost).catch(e => console.error('affiliate click', e))

  const res = NextResponse.json({ ok: true })
  res.cookies.set(REF_COOKIE, code, {
    maxAge: TERMS.cookieDays * 86400, path: '/', sameSite: 'lax', secure: true, httpOnly: false,
    domain: cookieDomain(req.headers.get('host')),
  })
  return res
}
