/**
 * Typed access to lib/bible-maps.json — built by build-bible-maps.py, which is
 * the single source of truth for the printable Bible maps + timeline. The
 * pages, the PDFs and the OG images all render from that one file; nothing
 * about the maps is hand-maintained here.
 *
 * Geography is real: Natural Earth 10m coastlines, clipped and projected
 * (equirectangular, x scaled by cos of the mid-latitude), with every place a
 * genuine lat/lon run through the same projection. Sites tradition locates
 * but scholarship disputes carry `traditional: true` and render with an
 * asterisk — the pages say so in copy. Never present a disputed site as
 * settled, and never "tidy away" the asterisks.
 */
import data from './bible-maps.json'

export type MapPlace = {
  name: string
  lat: number
  lon: number
  kind: 'capital' | 'city' | 'mountain' | 'site'
  dx: number
  dy: number
  note?: string
  anchor?: 'start' | 'end' | 'middle'
  traditional?: boolean
  small?: boolean
}

export type MapLabel = {
  name: string
  lat: number
  lon: number
  size: number
  color?: string
  angle?: number
}

export type MapRoute = {
  name: string
  style: 'exodus' | 'avoided' | 'j1' | 'j2' | 'j3' | 'rome'
  points: [number, number][]
}

export type MapTribe = {
  name: string
  lat: number
  lon: number
  rx: number
  ry: number
  color: string
}

export type BibleMap = {
  slug: string
  region: 'levant' | 'exodus' | 'eastmed'
  /** Crop the rendered viewBox at this latitude (bottom edge): the Levant
   *  region runs to the Gulf of Aqaba, which is empty desert on most maps. */
  cropLatMin?: number
  title: string
  shortTitle: string
  subtitle: string
  keyword: string
  scripture: string
  intro: string
  disclaimer?: string
  places: MapPlace[]
  labels: MapLabel[]
  routes: MapRoute[]
  tribes?: MapTribe[]
  rivers: [number, number][][]
  facts: string[]
}

export type MapRegion = {
  width: number
  height: number
  proj: { lonMin: number; latMax: number; kx: number; scale: number }
  land: string[]
  lakes: string[]
}

export type TimelineEra = {
  era: string
  dates: string
  note?: string
  events: string[]
  books: string
  storySlug?: string
}

export const REGIONS = data.regions as Record<string, MapRegion>
export const MAPS = data.maps as unknown as BibleMap[]
export const TIMELINE = data.timeline as TimelineEra[]

export const MAP_COUNT = MAPS.length
export const PLACE_COUNT = MAPS.reduce((n, m) => n + m.places.length, 0)
export const ERA_COUNT = TIMELINE.length

export function getMap(slug: string): BibleMap | undefined {
  return MAPS.find(m => m.slug === slug)
}

export function project(region: MapRegion, lat: number, lon: number): [number, number] {
  const { lonMin, latMax, kx, scale } = region.proj
  return [(lon - lonMin) * kx * scale, (latMax - lat) * scale]
}

// Build-time tripwires: a regenerated JSON that loses a map or an era should
// fail the build, not quietly ship a thinner page.
if (MAP_COUNT !== 6) throw new Error(`bible-maps: expected 6 maps, got ${MAP_COUNT}`)
// The /printables card says "Over 100 labeled places" — keep that claim true.
if (PLACE_COUNT <= 100) throw new Error(`bible-maps: only ${PLACE_COUNT} places; "Over 100" claim would be false`)
if (ERA_COUNT !== 13) throw new Error(`bible-maps: expected 13 timeline eras, got ${ERA_COUNT}`)
for (const m of MAPS) {
  if (!REGIONS[m.region]) throw new Error(`bible-maps: ${m.slug} references unknown region ${m.region}`)
  if (m.places.length + (m.tribes?.length ?? 0) < 6) {
    throw new Error(`bible-maps: ${m.slug} looks empty (${m.places.length} places)`)
  }
}
