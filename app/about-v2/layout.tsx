import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

/** VISUAL TEST of /about. Noindexed, unlinked; the live page is untouched.
 *
 *  This page is written for answer engines as much as for people: every claim
 *  is verifiable, counts are imported from the data so they cannot go stale,
 *  and the opening sentence of each section is the one an LLM will quote. None
 *  of that changes here — the sentences are the live page's, in the live order.
 *
 *  Metadata is the live page's own, verbatim, bar the marked line. */
export const metadata: Metadata = {
  title: 'About Faithful Kids',
  description:
    'What Faithful Kids is, what it costs, what ages it fits, and how it keeps kids safe. Plain answers about the Bible video app for kids ages 5-15.',
  alternates: { canonical: 'https://faithfulkids.app/about' },
  openGraph: {
    title: 'About Faithful Kids',
    description:
      'What Faithful Kids is, what it costs, what ages it fits, and how it keeps kids safe.',
    url: 'https://faithfulkids.app/about',
    siteName: 'Faithful Kids',
    type: 'website',
  },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
