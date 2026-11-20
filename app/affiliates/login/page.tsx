import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import '../../home.css'
import '../../v2-pages.css'
import '../affiliates.css'
import { V2Shell } from '@/app/v2-shell'
import { SESSION_COOKIE, verifySession } from '@/lib/affiliate-session'
import { LoginForm } from '../dashboard/client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Affiliate sign in | Faithful Kids',
  robots: { index: false, follow: true },
}

const NOTICES: Record<string, string> = {
  link: 'That sign-in link has expired or was already replaced. Enter your email for a fresh one.',
  out: '',
}

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (verifySession((await cookies()).get(SESSION_COOKIE)?.value)) redirect('/affiliates/dashboard')
  const { e } = await searchParams
  return (
    <V2Shell>
      <main id="main-content" className="af-acct" style={{ maxWidth: 560 }}>
        <p className="hv-eyebrow"><a href="/" style={{ color: 'inherit' }}>Faithful Kids</a> affiliate program</p>
        <h1>Affiliate sign in</h1>
        <p className="af-sub">{e === 'out' ? 'You are signed out. ' : ''}Enter the email you applied with and we will send you a sign-in link. No password needed.</p>
        <LoginForm notice={NOTICES[e || ''] || ''} />
        <p className="af-alt">Not an affiliate yet? <a href="/affiliates#apply">Apply to the program</a>.</p>
      </main>
    </V2Shell>
  )
}
