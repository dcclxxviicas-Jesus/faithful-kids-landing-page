import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'
import './home-v2.css'

/**
 * VISUAL TEST ONLY — a friendlier treatment of the homepage, built Oct 12 2026
 * because the owner's father asked for something warmer and more inviting.
 *
 * It is noindexed, absent from the sitemap and linked from nowhere on the site,
 * so no real visitor reaches it. `/` is untouched. If this is ever adopted,
 * the content here is the live homepage's content re-dressed — nothing new was
 * claimed. Prices come from app/api/checkout/route.ts, counts from
 * check-counts.py ground truth.
 */

const display = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { absolute: 'Faithful Kids — visual test' },
  robots: { index: false, follow: false },
}

export default function HomeV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} hv2`}>{children}</div>
}
