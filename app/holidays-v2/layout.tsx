import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

/** VISUAL TEST of /holidays. Noindexed, unlinked; the live page is untouched.
 *  Metadata is the live page's own, verbatim, bar the marked line. */
export const metadata: Metadata = {
  title: { absolute: 'Bible Activities for Every Holiday' },
  description:
    'Free Bible resources for kids by season: Christmas and Advent, Easter and Holy Week, Thanksgiving, back to school, and Halloween alternatives. No sign-up.',
  alternates: { canonical: 'https://faithfulkids.app/holidays' },
  openGraph: {
    title: 'Bible Activities for Every Holiday',
    description:
      'Free Bible resources for kids by season: Christmas, Easter, Thanksgiving, back to school and more.',
    url: 'https://faithfulkids.app/holidays',
    siteName: 'Faithful Kids',
    type: 'website',
  },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
