import { NextRequest, NextResponse } from 'next/server'
import { REF_COOKIE, TERMS, CODE_RE, SITE_URL, affiliateByCode, recordClick, cookieDomain, dbConfigured, isBot, refFromCookieHeader } from '@/lib/affiliates'

export const dynamic = 'force-dynamic'

/*
 * Affiliate short link: faithfulkids.app/r/<code>[?to=/some/page]. Records
 * the click, sets the 30-day fk_aff cookie for an active affiliate, and
 * redirects. `to` must be a path on this site, so the link can never be used
 * to bounce visitors to another domain. An unknown or inactive code still
 * redirects (the visitor should never see an error), it just credits no one.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params
  const code = String(raw || '').toLowerCase()
  const toParam = req.nextUrl.searchParams.get('to') || '/'
  const to = /^\/(?!\/)[^\s\\]*$/.test(toParam) ? toParam : '/'
  const dest = new URL(to, SITE_URL)
  dest.searchParams.set('utm_source', 'affiliate')
  dest.searchParams.set('utm_medium', 'referral')
  dest.searchParams.set('utm_campaign', `aff-${CODE_RE.test(code) ? code : 'unknown'}`)
  const res = NextResponse.redirect(dest, 302)
  res.headers.set('X-Robots-Tag', 'noindex')
  res.headers.set('Cache-Control', 'no-store')

  if (!CODE_RE.test(code) || !dbConfigured()) return res
  const a = await affiliateByCode(code).catch(() => null)
  if (!a || a.status !== 'active') return res

  let refHost: string | null = null
  try { const r = req.headers.get('referer'); refHost = r ? new URL(r).hostname.slice(0, 120) : null } catch { /* ignore */ }
  // One visitor = one count: a browser already carrying this affiliate's
  // cookie (a repeat click within 30 days) is not counted again.
  const repeat = refFromCookieHeader(req.headers.get('cookie')) === code
  if (!repeat && !isBot(req.headers.get('user-agent'))) await recordClick(a.id, to.slice(0, 300), refHost).catch(e => console.error('affiliate click', e))
  res.cookies.set(REF_COOKIE, code, {
    maxAge: TERMS.cookieDays * 86400, path: '/', sameSite: 'lax', secure: true, httpOnly: false,
    domain: cookieDomain(req.headers.get('host')),
  })
  return res
}
