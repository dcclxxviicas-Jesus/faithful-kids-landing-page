import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

const TITLE = 'Partner With Faithful Kids'
const DESCRIPTION =
  'Faithful Kids partners with Christian parenting, homeschool, and family creators \u2014 free full access to review, and paid collaborations for the right fit.'

/** VISUAL TEST of /creators. Noindexed, unlinked; the live page is untouched.
 *  Metadata is the live page's own, verbatim, bar the marked line. */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://faithfulkids.app/creators' },
  openGraph: {
    title: `${TITLE} — Creator Collaborations`,
    description: DESCRIPTION,
    url: 'https://faithfulkids.app/creators',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp',
      width: 1792, height: 1024,
      alt: 'Faithful Kids — Bible story videos for kids',
    }],
  },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
