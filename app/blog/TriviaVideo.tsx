'use client'

/**
 * A visible video block for trivia pages.
 *
 * Trivia pages already carried a video, but it lived inside the trivia game's
 * end screen — behind three gates: start the game, answer all ten questions,
 * scroll past the share buttons. On a page most visitors skim for questions to
 * use with their group, almost nobody reached it.
 *
 * This puts the same video on the page as its own section, below the questions
 * so it never competes with what the visitor actually came for.
 *
 * preload="none" + poster: a page view costs no bandwidth until play is pressed.
 */

import { useRef, useState } from 'react'
import posthog from 'posthog-js'

export function TriviaVideo({
  videoSrc, videoTitle, posterSrc, slug,
}: {
  videoSrc: string
  videoTitle: string
  posterSrc: string
  slug: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function start() {
    const v = ref.current
    if (!v) return
    setPlaying(true)
    v.muted = false
    v.volume = 1
    v.play().catch(() => {})
    try {
      posthog.capture('trivia_page_video_play', { post: slug, video: videoTitle })
    } catch {}
  }

  return (
    <section className="tv-wrap">
      <h2 className="tv-heading">Watch the story behind the questions</h2>
      <p className="tv-sub">
        A full lesson from the Faithful Kids library — free, no sign-up.
      </p>

      <div className={`sl-player${playing ? ' sl-playing' : ''}`}>
        <video
          ref={ref}
          className="sl-video"
          src={videoSrc}
          poster={posterSrc}
          preload="none"
          playsInline
          controls={playing}
        />
        {!playing && (
          <button className="sl-poster" onClick={start} aria-label={`Play ${videoTitle}`}>
            <span className="sl-shade" />
            <span className="sl-play">
              <span className="sl-ring" />
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72L19 12z" /></svg>
            </span>
            <span className="sl-play-label">{videoTitle}</span>
          </button>
        )}
      </div>

      <p className="tv-note">
        One of 200 video lessons, each with a quiz afterwards.{' '}
        <a href="/quiz?ref=trivia-video">Start your child&rsquo;s Bible journey</a>
      </p>
    </section>
  )
}
