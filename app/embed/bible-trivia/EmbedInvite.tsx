'use client'

import posthog from 'posthog-js'
import { EMBED_UTM } from '../../bible-trivia/TriviaQuizGame'

/* The only exit that everyone sees.
 *
 * Only 10 of 47 starts reach the results screen, so 79% of players never meet
 * a CTA at all — this line is their single route to us. It used to be 0.78rem
 * grey attribution that read as a legal footer. It is now a real click target
 * that says what is on the other side.
 *
 * Deliberately still BELOW the game and never interrupting it: this codebase
 * has twice removed mid-content interruptions, and the principle is settled.
 */
export function EmbedInvite() {
  return (
    <a
      className="tg-embed-invite"
      href={`https://faithfulkids.app/bible-trivia${EMBED_UTM}`}
      target="_blank"
      rel="noopener"
      onClick={() => {
        try { posthog.capture('trivia_embed_invite_click', { surface: 'embed' }) } catch { /* never block the link */ }
      }}
    >
      <span className="tg-embed-invite-main">
        Free Bible videos &amp; games for kids
      </span>
      <span className="tg-embed-invite-sub">
        Made by Faithful Kids &mdash; see the whole thing &rarr;
      </span>
    </a>
  )
}
