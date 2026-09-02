import type { Metadata } from 'next'
import { TriviaQuizGame } from '../../bible-trivia/TriviaQuizGame'
import { AutoResize } from './AutoResize'
import { EmbedInvite } from './EmbedInvite'

// The iframe-embeddable version of the trivia game. Noindex: it's a utility
// duplicate of /bible-trivia, which is the page we want ranking (embedders'
// credit links point there too).
export const metadata: Metadata = {
  title: 'Bible Trivia — Faithful Kids',
  robots: { index: false, follow: true },
}

export default function BibleTriviaEmbed() {
  return (
    <main
      style={{
        padding: '10px 8px 6px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        background: 'transparent',
      }}
    >
      <AutoResize />
      <TriviaQuizGame embed />
      <EmbedInvite />
    </main>
  )
}
