'use client'

import { STORIES } from './stories'
import { VideoTile } from './VideoTile'

/**
 * Three real lessons on /homeschool. Nobody buys a video curriculum without
 * seeing one, so this is the proof rather than a description of it.
 */
export function LessonSamples() {
  return (
    <div className="lesson-samples">
      {/* Three, not four — the grid is three columns and a fourth orphans.
          These three are deliberately from three different series. */}
      {STORIES.slice(0, 3).map((s) => (
        <figure key={s.src} className="lesson-sample">
          <VideoTile
            src={s.src}
            poster={s.poster}
            title={s.title}
            badge={s.series}
            blurb={s.blurb}
            location="homeschool"
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
