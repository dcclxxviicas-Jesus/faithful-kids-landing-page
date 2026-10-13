import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

/** VISUAL TEST of /beliefs. Noindexed, unlinked; the live page is untouched.
 *  Metadata is the live page's own, verbatim, bar the marked line. */
const TITLE = 'What We Believe'
const DESCRIPTION =
  'The statement of faith behind Faithful Kids: the Bible as God’s Word, the Trinity, and salvation in Jesus Christ. Creedal common ground for Christian families across traditions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://faithfulkids.app/beliefs' },
  openGraph: {
    title: `${TITLE} — Faithful Kids`,
    description: DESCRIPTION,
    url: 'https://faithfulkids.app/beliefs',
    siteName: 'Faithful Kids',
    type: 'website',
  },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
