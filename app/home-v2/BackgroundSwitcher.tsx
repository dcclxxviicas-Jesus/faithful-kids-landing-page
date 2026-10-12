'use client'

import { useLayoutEffect, useState } from 'react'

export type Bg = { id: string; label: string; file: string }

/** Hero options to flip through. Add a row here and it appears in the picker. */
export const BACKGROUNDS: Bg[] = [
  { id: '1', label: 'Story time',   file: 'hero-jesus-kids.webp' },
  { id: '2', label: 'Meadow',       file: 'bg2-meadow.webp' },
  { id: '3', label: 'Ark + rainbow', file: 'bg3-ark.webp' },
  { id: '4', label: 'Lakeside',     file: 'bg4-lakeside.webp' },
  { id: '5', label: 'Hilltop kids', file: 'bg5-storytime.webp' },
]

export function useHeroBackground() {
  const [bg, setBg] = useState<Bg>(BACKGROUNDS[0])

  /* The page is prerendered, so reading the URL in a useState initializer is a
     hydration mismatch and a plain useEffect paints option 1 and then swaps.
     A layout effect settles it before paint. */
  useLayoutEffect(() => {
    const want = new URLSearchParams(window.location.search).get('bg')
    const found = BACKGROUNDS.find(b => b.id === want)
    if (found) setBg(found)
  }, [])

  function choose(next: Bg) {
    setBg(next)
    const url = new URL(window.location.href)
    url.searchParams.set('bg', next.id)
    window.history.replaceState({}, '', url)   // shareable, no reload
  }

  return { bg, choose }
}

export function BackgroundSwitcher({
  current, onChoose, cdn,
}: { current: Bg; onChoose: (b: Bg) => void; cdn: string }) {
  return (
    <div className="hv-switch" role="group" aria-label="Try a different hero background">
      <span className="hv-switch-label">Background</span>
      {BACKGROUNDS.map(b => (
        <button
          key={b.id}
          className={`hv-switch-btn${b.id === current.id ? ' is-on' : ''}`}
          onClick={() => onChoose(b)}
          title={b.label}
          aria-pressed={b.id === current.id}
        >
          <img src={`${cdn}/home-v2/${b.file}`} alt="" width={64} height={42} loading="lazy" />
          <span>{b.label}</span>
        </button>
      ))}
    </div>
  )
}
