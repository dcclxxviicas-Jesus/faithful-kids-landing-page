'use client'

import posthog from 'posthog-js'
import { STORIES } from './stories'

/**
 * Three real lessons, playable. Nobody buys a video curriculum without seeing
 * one first, so this is the proof rather than a description of the proof.
 *
 * preload="none" plus a poster means a pageview costs no bandwidth until
 * someone presses play — the files are ~30MB.
 */
export function LessonSamples() {
  return (
    <div className="lesson-samples">
      {STORIES.map((s) => (
        <figure key={s.src} className="lesson-sample">
          <video
            src={s.src}
            poster={s.poster}
            controls
            playsInline
            preload="none"
            className="lesson-sample-video"
            onPlay={() => {
              try {
                posthog.capture('homeschool_sample_play', { title: s.title })
              } catch {
                /* analytics must never break the page */
              }
            }}
          />
          <figcaption>
            <span className="lesson-sample-series">{s.series}</span>
            <strong>{s.title}</strong>
            <p>{s.blurb}</p>
            <span className="lesson-sample-meta">
              About 2 minutes &middot; quiz and reflection after
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
