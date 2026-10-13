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

/**
 * Everything below except the `robots` line is the live page's real metadata,
 * copied verbatim from app/bible-stories-for-kids/page.tsx. Launching this is
 * deleting that one line and moving the files; nothing else about what Google
 * sees would change.
 */
export const metadata: Metadata = {
  title: '200 Bible Stories for Kids, Retold Simply',
  description:
    '200 Bible stories for kids, Genesis to Revelation, each retold simply with its scripture reference, discussion questions and a video lesson. No sign-up.',
  keywords: [
    'bible stories for kids', 'kids bible stories', 'short bible stories for kids',
    'best bible stories for kids', 'bible stories for children',
    'stories from the bible for kids', 'free bible stories for kids',
    'bedtime bible stories for kids',
  ],
  alternates: { canonical: 'https://faithfulkids.app/bible-stories-for-kids' },
  openGraph: {
    title: '200 Bible Stories for Kids, Retold Simply',
    description:
      '200 Bible stories for kids, Genesis to Revelation, each with the scripture reference, discussion questions and a video lesson. Free, no sign-up.',
    url: 'https://faithfulkids.app/bible-stories-for-kids',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp',
      width: 1792,
      height: 1024,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '200 Bible Stories for Kids, Retold Simply',
    description: '200 Bible stories for kids, Genesis to Revelation. Free, no sign-up.',
    images: ['https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp'],
  },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function StoriesV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} hv2`}>{children}</div>
}
