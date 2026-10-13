import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

/** VISUAL TEST of /printables. Noindexed, unlinked; the live page is untouched.
 *  Metadata below is the live page's own, verbatim, bar the marked line. */
export const metadata: Metadata = {
  title: 'Free Printable Bible Activities for Kids',
  description:
    'Free printable Bible resources for families: 100 Bible trivia questions, a 30-day family Bible challenge, and a bedtime Bible kit. No sign-up required.',
  alternates: { canonical: 'https://faithfulkids.app/printables' },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
