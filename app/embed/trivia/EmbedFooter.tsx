'use client'

import posthog from 'posthog-js'

/* The only exit most players ever see.
 *
 * On the general embed just 10 of 47 starts reached the results screen, so
 * roughly four in five players never meet a CTA. This line is their one route
 * to us, and it is also the credit link the host agreed to when they took the
 * snippet — pointed at THIS game's post, not at a shared page.
 *
 * Deliberately below the game and never interrupting it: this codebase has
 * twice removed mid-content interruptions, and the principle is settled.
 */
export function EmbedFooter({ slug }: { slug: string }) {
  const href = `https://faithfulkids.app/blog/${slug}?utm_source=embed&utm_medium=iframe&utm_campaign=trivia-${slug}`
  return (
    <a
      className="tg-embed-invite"
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => {
        try { posthog.capture('trivia_embed_invite_click', { surface: 'embed', post: slug }) } catch { /* never block the link */ }
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
