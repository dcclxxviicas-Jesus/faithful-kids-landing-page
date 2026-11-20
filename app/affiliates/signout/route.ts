import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/affiliates'
import { SESSION_COOKIE } from '@/lib/affiliate-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const res = NextResponse.redirect(new URL('/affiliates/login?e=out', SITE_URL), 303)
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
