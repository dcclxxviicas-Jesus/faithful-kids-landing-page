import type { Metadata } from 'next'
import { TriviaQuizGame } from '../../bible-trivia/TriviaQuizGame'

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
      <TriviaQuizGame embed />
      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', margin: '10px 0 0' }}>
        Made with 💚 by{' '}
        <a
          href="https://faithfulkids.app/bible-trivia"
          target="_blank"
          rel="noopener"
          style={{ color: '#059669', fontWeight: 700 }}
        >
          Faithful Kids
        </a>{' '}
        — free Bible learning for kids
      </p>
    </main>
  )
}
