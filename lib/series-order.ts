/**
 * The order the Bible happens in.
 *
 * Posts carry `series` and `episode` but nothing that says which series comes
 * first, so `getAllPosts()` fell back to sorting series names alphabetically.
 * That put Elijah and Elisha, then Exile and Faith, at the top of
 * /bible-stories-for-kids — on a page whose own copy promises "the whole story
 * ... in the order it happened". Genesis appeared fourth.
 *
 * Source of truth is the curriculum itself: the top-level order of
 * bible-kids/src/data/all-series.ts, which `generate-all-series.py` writes from
 * the folder structure and which the YouTube queue also follows (strict Bible
 * chronological order is an owner mandate there).
 *
 * A series not listed here sorts after every listed one, alphabetically, so
 * adding content can never make a story vanish from a page — it just lands at
 * the end until someone adds it here.
 */
export const SERIES_ORDER: string[] = [
  // Old Testament
  'genesis',
  'exodus',
  'promised-land',
  'judges-and-ruth',
  'rise-of-kings',
  'king-davids-reign',
  'solomon-and-the-kingdom',
  'elijah-and-elisha',
  'exile-and-faith',
  'the-return-home',
  // New Testament
  'birth-of-jesus',
  'jesus-begins-ministry',
  'teachings-of-jesus',
  'miracles-of-jesus',
  'road-to-the-cross',
  'he-is-risen',
  'early-church',
  'pauls-adventures',
  'letters-to-churches',
  'ending-and-beginning',
]

const INDEX = new Map(SERIES_ORDER.map((slug, i) => [slug, i]))

/** Position of a series in the curriculum; unlisted series sort last. */
export function seriesRank(seriesSlug?: string): number {
  if (!seriesSlug) return Number.MAX_SAFE_INTEGER
  const i = INDEX.get(seriesSlug)
  return i === undefined ? Number.MAX_SAFE_INTEGER : i
}

/**
 * Display names. The frontmatter spellings lost their apostrophes somewhere in
 * generation ("Pauls Adventures", "King Davids Reign") and are inconsistently
 * capitalised ("He is Risen"). Fixing them here rather than rewriting 200 files
 * keeps one place to look and leaves the slugs — which are URLs — untouched.
 */
const LABELS: Record<string, string> = {
  'king-davids-reign': "King David's Reign",
  'pauls-adventures': "Paul's Adventures",
  'he-is-risen': 'He Is Risen',
}

export function seriesLabel(seriesSlug: string, fallback: string): string {
  return LABELS[seriesSlug] ?? fallback
}

/**
 * Take `limit` items, round-robin across series, instead of the first `limit`
 * in order.
 *
 * Once posts sort in curriculum order, "the first six stories about courage"
 * are all from Exodus and "the first six about faith" are all from Genesis, so
 * every theme card reads as one series under a different name. A parent
 * picking a story for tonight wants range, not the first six of one book.
 */
export function spreadBySeries<T extends { seriesSlug?: string }>(items: T[], limit: number): T[] {
  const queues = new Map<string, T[]>()
  for (const it of items) {
    const k = it.seriesSlug ?? ''
    if (!queues.has(k)) queues.set(k, [])
    queues.get(k)!.push(it)
  }
  const lanes = Array.from(queues.values())
  const out: T[] = []
  let i = 0
  while (out.length < limit && lanes.some(q => q.length > 0)) {
    const lane = lanes[i % lanes.length]
    if (lane.length > 0) out.push(lane.shift() as T)
    i++
  }
  return out
}
