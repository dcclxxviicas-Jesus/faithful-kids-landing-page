'use client'

import { VideoTile } from '../components/VideoTile'

/**
 * The conversion block for printable pages.
 *
 * A free printable earns attention but spends none of it: the visitor takes the
 * sheet and leaves. A paragraph and a button asked them to imagine the product.
 * This shows it — the actual episode, playable, before the ask.
 *
 * On a page where someone just printed Noah's Ark, the Noah episode is the
 * strongest thing we can put in front of them, so the video is matched to the
 * scene wherever a matching episode exists.
 *
 * preload="none" + poster: costs nothing until pressed. Plays with sound.
 */

import { useRef, useState } from 'react'
import posthog from 'posthog-js'

export function PrintableCta({
  videoSrc, posterSrc, videoTitle, duration, heading, body, source,
}: {
  videoSrc: string
  posterSrc: string
  videoTitle: string
  duration?: string
  heading: string
  body: string
  source: string
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
      posthog.capture('printable_cta_video_play', { source, video: videoTitle })
    } catch {}
  }

  return (
    <section className="pc-wrap no-print">
      <div className="pc-inner">
        <div className="pc-copy">
          <span className="pc-eyebrow">See what they get</span>
          <h2>{heading}</h2>
          <p>{body}</p>
          <a
            className="pc-btn"
            href={`/quiz?ref=${source}`}
            onClick={() => {
              try { posthog.capture('printable_cta_click', { source, video: videoTitle }) } catch {}
            }}
          >
            Start your child&rsquo;s Bible journey
          </a>
          <ul className="pc-points">
            {/* "300+" matches the claim in the body copy above it — the card
                said "200 stories" and "300+" at once, which reads as a site
                that can't count its own product. 310 public lessons is the
                real figure; 300+ is the one floor check-counts verifies. */}
            <li>300+ lessons, Genesis to Revelation, in order</li>
            <li>A quiz after every one, so you see what stuck</li>
            <li>No ads, no algorithm &middot; cancel anytime</li>
          </ul>
        </div>

        <div className="pc-video">
          <VideoTile
            src={videoSrc}
            poster={posterSrc}
            title={videoTitle}
            location="printables"
          />
          <p className="pc-caption">A real lesson from the app — watch the whole thing free.</p>
        </div>
      </div>
    </section>
  )
}
