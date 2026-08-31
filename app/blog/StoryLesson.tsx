'use client'

/**
 * The free lesson on every story post: watch the full episode, then get
 * offered the app at the moment of peak intent — the video's end.
 *
 * Why it exists: all 200 story posts emitted VideoObject schema while rendering
 * no player at all, and the mid-article CTA asked people to pay before they had
 * seen anything. Showing the video makes the schema honest and puts the demo
 * before the ask.
 *
 * The 3-question quiz that used to follow the video was removed Aug 29, 2026
 * (owner decision). Its numbers looked like "27 opened → 5 answered", but the
 * 27 was an artifact: the quiz AUTO-OPENED on video completion (an effect
 * fired openQuiz whenever watched became true), so "quiz_start" measured
 * video completions, not intent — only ~5 of 55 viewers ever chose to engage,
 * and 4 of those 5 finished. Real demand was tiny; removal stands on honest
 * numbers. The video-end offer below replaces the nothing that previously
 * rendered on completion.
 *
 * Bandwidth: preload="none" + poster, so a page view costs nothing until play
 * is pressed. These files are ~30MB.
 */

import { useRef, useState } from 'react'
import posthog from 'posthog-js'

function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch {
    // analytics must never break the lesson
  }
}

export function StoryLesson({
  videoUrl, posterUrl, captionsUrl, storyName, slug, duration,
}: {
  videoUrl: string
  posterUrl: string
  captionsUrl?: string
  storyName: string
  slug: string
  /** Real runtime, e.g. "2:07" — read from the file with ffprobe, never guessed. */
  duration?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [watched, setWatched] = useState(false)
  const [halfway, setHalfway] = useState(false)
  const offerShownFired = useRef(false)

  // Real click = a user gesture, so this plays with sound. Never muted.
  function start() {
    const v = videoRef.current
    if (!v) return
    setPlaying(true)
    v.muted = false
    v.volume = 1
    v.play().catch(() => {/* user can still use native controls */})
    track('story_lesson_video_play', { slug })
  }

  return (
    <div className="sl-wrap">
      {/* ---------------- video ---------------- */}
      <div className={`sl-player${playing ? ' sl-playing' : ''}`}>
        <video
          ref={videoRef}
          className="sl-video"
          src={videoUrl}
          poster={posterUrl}
          preload="none"
          playsInline
          controls={playing}
          onTimeUpdate={e => {
            const v = e.currentTarget
            if (!halfway && v.duration && v.currentTime / v.duration >= 0.5) {
              setHalfway(true)
              track('story_lesson_video_half', { slug })
            }
          }}
          onEnded={() => {
            setWatched(true)
            track('story_lesson_video_complete', { slug })
            if (!offerShownFired.current) {
              offerShownFired.current = true
              track('story_lesson_offer_shown', { slug, placement: 'video_end' })
            }
          }}
        >
          {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />}
        </video>

        {!playing && (
          <button className="sl-poster" onClick={start} aria-label={`Play ${storyName}`}>
            <span className="sl-shade" />
            <span className="sl-play">
              <span className="sl-ring" />
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72L19 12z" /></svg>
            </span>
            <span className="sl-play-label">Watch {storyName}</span>
            {duration && <span className="sl-duration">{duration}</span>}
          </button>
        )}
      </div>

      {/* ---------------- video-end offer ----------------
          Peak intent: a parent who just watched a full Bible story with their
          kid. This used to render nothing. */}
      {watched && (
        <div className="sl-card sl-done" style={{ marginTop: 16 }}>
          <p className="sl-pitch" style={{ margin: 0 }}>
            <strong>That&rsquo;s one of 300+ videos.</strong>
          </p>
          <p className="sl-pitch" style={{ marginTop: 6 }}>
            Every story works like this one: three minutes, and progress you can actually see.
          </p>
          <a
            className="sl-btn sl-btn-green sl-cta"
            href="/quiz?ref=story-video-end"
            onClick={() => track('story_lesson_offer_click', { slug, placement: 'video_end' })}
          >
            Watch more stories like this &rarr;
          </a>
        </div>
      )}
    </div>
  )
}
