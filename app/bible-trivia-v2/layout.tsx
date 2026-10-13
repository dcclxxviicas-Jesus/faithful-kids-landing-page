import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

/** VISUAL TEST of /bible-trivia. Noindexed, unlinked; the live page is
 *  untouched. Metadata is the live page's own, verbatim, bar the marked line. */
export const metadata: Metadata = {
  title: 'Free Bible Trivia for Kids — 100 Questions',
  description:
    'Play free Bible trivia online: 100 kid-friendly questions across easy, medium and hard levels, every answer with its verse. Free to embed on your site.',
  alternates: { canonical: 'https://faithfulkids.app/bible-trivia' },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
