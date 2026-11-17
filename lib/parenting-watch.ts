/* Which three Bible-story lessons the "Watch the stories" block at the end of a
   Parenting essay shows (owner's design, Nov 16, 2026).

   The choice is made by code at build time, never by hand, so it cannot drift:
   1. `watch:` in the essay's frontmatter, if present, wins. Each entry must be
      the slug of a blog STORY post (one with a video lesson); anything else
      fails the build, so a typo can never ship a broken tile.
   2. Otherwise, the story posts the essay itself links to, in reading order.
   3. Any empty places are filled from FALLBACK, three well-known lessons.
   The heading says "from this essay" only when all three came from the essay. */
import { getPostBySlug } from './blog'
import type { Article } from './parenting'

export interface WatchStory { slug: string; title: string; image: string; href: string }

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
/* Four blog story titles lost their punctuation when they were slugged; show
   them correctly here rather than touching the blog posts (the SEO lane's).
   All 200 story titles were checked for dropped apostrophes on Nov 16, 2026. */
const TITLE_FIX: Record<string, string> = {
  'Balaams Donkey': "Balaam's Donkey",
  'Hamans Evil Plot': "Haman's Evil Plot",
  'Deborah a Brave Leader': 'Deborah, a Brave Leader',
  'Ruth a Story of Loyalty': 'Ruth, a Story of Loyalty',
}

export const WATCH_FALLBACK = ['david-and-goliath-for-kids', 'noah-and-the-great-flood-for-kids', 'calming-the-storm-for-kids']

function storyFor(slug: string): WatchStory | null {
  const post = getPostBySlug(slug)
  if (!post || !post.seriesSlug || !post.episode) return null // not a story lesson
  return {
    slug,
    title: (s => TITLE_FIX[s] || s)(post.title.split(':')[0].replace(/ for Kids$/i, '').trim()),
    image: `${CDN}/blog-images/${slug}-hero.webp`,
    href: `/blog/${slug}`,
  }
}

export function getWatchStories(a: Article): { stories: WatchStory[]; fromEssay: boolean } {
  const picked: WatchStory[] = []
  const add = (s: WatchStory | null) => { if (s && picked.length < 3 && !picked.some(p => p.slug === s.slug)) picked.push(s) }

  if (a.watch.length > 0) {
    for (const slug of a.watch) {
      const s = storyFor(slug)
      if (!s) throw new Error(`content/parenting/${a.slug}.md: watch: "${slug}" is not a Bible story post with a video lesson`)
      add(s)
    }
  } else {
    for (const m of a.contentHtml.matchAll(/href="(?:https:\/\/faithfulkids\.app)?\/blog\/([a-z0-9-]+)"/g)) add(storyFor(m[1]))
  }
  const fromEssay = picked.length === 3
  for (const slug of WATCH_FALLBACK) add(storyFor(slug))
  return { stories: picked, fromEssay }
}

/* Split the essay body for the mid-article newsletter box: at the end of a
   top-level paragraph that is followed by another paragraph (never inside a
   list or quote, never next to a heading), as close to 40% of the way through
   as possible. Returns null when no such spot exists. */
export function splitForSignup(html: string): [string, string] | null {
  const containers = new Set(['ul', 'ol', 'blockquote', 'figure', 'div', 'table'])
  const re = /<(\/?)([a-z0-9]+)\b[^>]*>/gi
  let depth = 0
  let paragraphsSeen = 0
  const spots: number[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const closing = m[1] === '/'
    const tag = m[2].toLowerCase()
    if (containers.has(tag)) { depth += closing ? -1 : 1; continue }
    if (tag === 'p' && closing && depth === 0) {
      paragraphsSeen++
      const end = m.index + m[0].length
      if (paragraphsSeen >= 2 && /^\s*<p[\s>]/.test(html.slice(end))) spots.push(end)
    }
  }
  if (spots.length === 0) return null
  const target = html.length * 0.4
  const at = spots.reduce((best, s) => (Math.abs(s - target) < Math.abs(best - target) ? s : best), spots[0])
  return [html.slice(0, at), html.slice(at)]
}
