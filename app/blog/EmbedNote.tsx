'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

/**
 * "Put this game on your site" — under the game on every trivia post.
 *
 * Deliberately one quiet line until it is clicked. A Sunday-school teacher
 * reading the post is not the audience for a code box, and the CTA stack under
 * these games is already long; but the person who runs a ministry blog will
 * never guess an embed exists unless something says so. Closed, it costs one
 * line. Open, it is the whole snippet.
 *
 * Every embed is per-post, so the credit link in the snippet points at THIS
 * page. That is the actual return: a distinct backlink per placement, to the
 * page we want ranking, rather than every embed on the internet pointing at
 * one URL.
 */
export function EmbedNote({ slug, label }: { slug: string; label: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const title = /trivia/i.test(label) ? label : `${label} Bible Trivia`
  const frameId = `fk-trivia-${slug}`
  const code =
    `<iframe id="${frameId}" src="https://faithfulkids.app/embed/trivia/${slug}" width="100%" height="780" style="border:0;border-radius:16px;max-width:640px" title="${title} for Kids" loading="lazy"></iframe>\n` +
    `<script>window.addEventListener("message",function(e){if(e.origin!=="https://faithfulkids.app")return;var d=e.data;if(!d||d.type!=="fk-trivia-height")return;var f=document.getElementById("${frameId}");if(f)f.height=d.height;});</script>\n` +
    `<p style="font-size:14px"><a href="https://faithfulkids.app/blog/${slug}">${title} game by Faithful Kids</a></p>`

  const toggle = () => {
    setOpen(o => !o)
    if (!open) {
      try { posthog.capture('trivia_embed_note_open', { post: slug }) } catch { /* never block */ }
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
      posthog.capture('trivia_embed_copied', { post: slug })
    } catch {
      // clipboard blocked — the code is on screen to copy by hand
    }
  }

  return (
    <div className="tg-embed-note">
      <button className="tg-embed-note-toggle" onClick={toggle} aria-expanded={open}>
        {'\u{1F517}'} Put this game on your site {open ? '–' : '+'}
      </button>

      {open && (
        <div className="tg-embed-note-body">
          <p className="tg-embed-note-lead">
            Free to use on any church, school or ministry site. Paste this
            wherever you want the game to appear &mdash; it keeps working on its
            own, and the credit link back to this page is the only thing we ask.
          </p>
          <pre className="tg-embed-code">{code}</pre>
          <button className="tg-btn" onClick={copy}>
            {copied ? 'Copied! ✓' : 'Copy embed code'}
          </button>
        </div>
      )}
    </div>
  )
}
