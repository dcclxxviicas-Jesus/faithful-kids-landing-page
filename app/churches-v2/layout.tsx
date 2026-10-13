import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { V2Shell } from '../v2-shell'

/**
 * VISUAL TEST of /churches. Noindexed and linked from nowhere; the live page is
 * untouched. Same copy, same links, same claims — only the presentation moves.
 *
 * Everything below except `robots` is the live page's own metadata, verbatim.
 * Launching this is deleting that one line.
 */
export const metadata: Metadata = {
  title: 'Free for Churches — Kids Bible Video Lessons',
  description:
    'Free for churches: give your Sunday school or kids ministry full access to 300+ Bible video episodes with quizzes, plus printables and a trivia game.',
  alternates: { canonical: 'https://faithfulkids.app/churches' },
  // THE ONE TEST-ONLY LINE. Delete it to launch.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <V2Shell>{children}</V2Shell>
}
