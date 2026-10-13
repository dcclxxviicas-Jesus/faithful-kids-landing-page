import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'
import '../home.css'   // shared .hv2 design language (the homepage's own)
import './stories-v2.css'

/**
 * VISUAL TEST ONLY — the friendlier treatment applied to
 * /bible-stories-for-kids. Noindexed, absent from the sitemap, linked from
 * nowhere. The real page is untouched.
 *
 * The real page is a genuine SEO asset: "bible stories for kids" is 1,479/mo
 * and winnable, and the 200 internal links ARE the point of it. So every link
 * here is preserved — this only changes how they look.
 */

const display = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { absolute: 'Bible Stories for Kids — visual test' },
  robots: { index: false, follow: false },
}

export default function StoriesV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} hv2`}>{children}</div>
}
