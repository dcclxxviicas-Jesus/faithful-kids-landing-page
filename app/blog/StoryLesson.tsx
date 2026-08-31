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
import { VideoTile } from '@/app/components/VideoTile'
import posthog from 'posthog-js'

function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch {
    // analytics must never break the lesson
  }
}

export function StoryLesson({
  videoUrl, posterUrl, captionsUrl, storyName, slug,
}: {
  videoUrl: string
  posterUrl: string
  captionsUrl?: string
  storyName: string
  slug: string
}) {
  const [watched, setWatched] = useState(false)
  const halfFired = useRef(false)
  const offerShownFired = useRef(false)

  return (
    <div className="sl-wrap">
      {/* Same tile and lightbox as the rest of the site: muted preview, then
          the full lesson with sound from the start. The tracking that used to
          hang off a bespoke player is passed through as callbacks so the
          funnel data stays continuous. */}
      <VideoTile
        src={videoUrl}
        poster={posterUrl}
        captionsUrl={captionsUrl}
        title={storyName}
        location="story_post"
        ctaHref="/quiz?ref=story-video-end"
        ctaLabel="Watch more stories like this &rarr;"
        onOpen={() => track('story_lesson_video_play', { slug })}
        onHalfway={() => {
          if (halfFired.current) return
          halfFired.current = true
          track('story_lesson_video_half', { slug })
        }}
        onEnded={() => {
          setWatched(true)
          track('story_lesson_video_complete', { slug })
          if (!offerShownFired.current) {
            offerShownFired.current = true
            track('story_lesson_offer_shown', { slug, placement: 'video_end' })
          }
        }}
      />

      {/* ---------------- video-end offer ----------------
          Peak intent: a parent who just watched a full Bible story with their
          kid. This used to render nothing. */}
      {watched && (
        <div className="sl-card sl-done" style={{ marginTop: 16 }}>
          <p className="sl-pitch" style={{ margin: 0 }}>
            <strong>That&rsquo;s one of 300+ videos.</strong>
          </p>
          <p className="sl-pitch" style={{ marginTop: 6 }}>
            Every story works like this one: about two minutes, and progress you can actually see.
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
