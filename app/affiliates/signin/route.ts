import { NextRequest, NextResponse } from 'next/server'
import { affiliateByToken, getAffiliate, SITE_URL } from '@/lib/affiliates'
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifyLink } from '@/lib/affiliate-session'

export const dynamic = 'force-dynamic'

/* Turns a sign-in link into a 30-day session cookie, then opens the
   dashboard. ?t= is the one-hour link from /affiliates/login; ?k= is the
   never-expiring link in the welcome email. */
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t')
  const k = req.nextUrl.searchParams.get('k')
  const fail = NextResponse.redirect(new URL('/affiliates/login?e=link', SITE_URL), 303)

  let a = null
  if (t) { const id = verifyLink(t); a = id ? await getAffiliate(id).catch(() => null) : null }
  else if (k) a = await affiliateByToken(k).catch(() => null)
  if (!a || !['active', 'paused', 'closed'].includes(a.status)) return fail

  const res = NextResponse.redirect(new URL('/affiliates/dashboard', SITE_URL), 303)
  res.cookies.set(SESSION_COOKIE, signSession(a.id), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86400,
  })
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('X-Robots-Tag', 'noindex')
  return res
}
