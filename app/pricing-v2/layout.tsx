import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

/** VISUAL TEST of /pricing. Noindexed, unlinked; the live page is untouched.
 *
 *  Every figure on this page is read from the checkout routes and App Store
 *  Connect, and web and Apple prices are DELIBERATELY different. Nothing here
 *  recalculates, rounds or 'aligns' anything \u2014 the numbers are the live
 *  page's, character for character.
 *
 *  Metadata is the live page's own, verbatim, bar the marked line. */
export const metadata: Metadata = {
  title: 'Faithful Kids Pricing: Web and iOS Plans',
  description:
    'Web: $12.99/month or $97/year, 7-day trial on annual. iOS: $8.99/month or $79.99/year, Apple 3-day trial. Free for churches. Every plan, stated exactly.',
  alternates: { canonical: 'https://faithfulkids.app/pricing' },
  openGraph: {
    title: 'Faithful Kids Pricing',
    description: 'Every plan, both platforms, both trial lengths, stated exactly.',
    url: 'https://faithfulkids.app/pricing',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/faithful-kids-scope-and-sequence-hero.webp',
      width: 1536, height: 1024,
      alt: 'Faithful Kids pricing — web and iOS plans',
    }],
  },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
