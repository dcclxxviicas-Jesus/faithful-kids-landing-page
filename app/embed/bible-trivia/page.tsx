import type { Metadata } from 'next'
import { TriviaQuizGame } from '../../bible-trivia/TriviaQuizGame'
import { AutoResize, CONTENT_ID } from './AutoResize'
import { EmbedInvite } from './EmbedInvite'
import './embed.css'

// The iframe-embeddable version of the trivia game. Noindex: it's a utility
// duplicate of /bible-trivia, which is the page we want ranking (embedders'
// credit links point there too).
//
// No X-Frame-Options and no CSP frame-ancestors anywhere for this route, by
// design — it has to stay frameable by any origin. rando.gg's link checker
// auto-retires games that stop being frameable, which would silently drop us
// from a 413-game catalogue.
export const metadata: Metadata = {
  title: 'Bible Trivia — Faithful Kids',
  robots: { index: false, follow: true },
}

export default function BibleTriviaEmbed() {
  return (
    /* Fills whatever height the host gives it and centres the card, rather
       than sitting at the top of a taller frame with a void beneath. Most
       hosts size their own frame and will never adopt our resize listener, so
       this — not the postMessage — is the fix that has to work everywhere.
       Background stays transparent: hosts have their own themes, and at least
       one embedder has a dark mode a filled panel would fight. */
    <main className="fk-embed">
      <AutoResize />
      <div id={CONTENT_ID} className="fk-embed-content">
        <TriviaQuizGame embed />
        <EmbedInvite />
      </div>
    </main>
  )
}
