import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

/** VISUAL TEST of /blog ("For Parents"). Noindexed, unlinked; the live page is
 *  untouched. Metadata is the live page's own, verbatim, bar the marked line. */
export const metadata: Metadata = {
  title: 'Bible Guides for Parents — 500+ Free Resources',
  description: 'Free Bible guides for Christian parents and Sunday school teachers: trivia, printables, lesson ideas, devotions and discussion questions for every age.',
  keywords: ['bible guides for parents', 'sunday school lesson ideas', 'bible activities for kids', 'christian parenting resources', 'bible trivia for kids', 'family devotion ideas'],
  openGraph: {
    title: 'Bible Guides for Parents — 500+ Free Resources',
    description: 'Free Bible guides for Christian parents and Sunday school teachers: trivia, printables, lesson ideas and discussion questions for every age.',
    url: 'https://faithfulkids.app/blog',
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
    title: 'Bible Guides for Parents — 500+ Free Resources',
    description: 'Free Bible guides, trivia, printables and lesson ideas for parents and teachers.',
    images: ['https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp'],
  },
  alternates: { canonical: 'https://faithfulkids.app/blog' },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
