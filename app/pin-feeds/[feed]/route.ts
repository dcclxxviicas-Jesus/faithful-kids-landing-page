import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/blog'
import pinManifest from '@/lib/pin-manifest.json'

// RSS feeds for Pinterest auto-publish (Settings -> Bulk create Pins).
// One feed per content cluster -> one Pinterest board each. Pinterest polls
// daily and pins anything new, so each feed reveals a few more posts per day
// (deterministic by date) until the whole library is drip-published; new blog
// posts join their feed's queue automatically.
//
// Feeds: /pin-feeds/trivia.xml, stories.xml, verses.xml, parenting.xml

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const SITE = 'https://faithfulkids.app'
const LAUNCH = Date.UTC(2026, 7, 16) // Aug 16, 2026 — day one of the drip
const PER_DAY = 4 // new pins per feed per day
const MAX_ITEMS = 80 // Pinterest only needs to see the newest items

const FEEDS: Record<string, { title: string; match: (slug: string) => boolean }> = {
  trivia: {
    title: 'Bible Trivia & Games for Kids',
    match: (s) => /trivia|quiz|riddle|game|puzzle/.test(s),
  },
  verses: {
    title: 'Bible Verses & Prayers for Kids',
    match: (s) => /verse|prayer|psalm|scripture|memoriz/.test(s),
  },
  parenting: {
    title: 'Christian Parenting & Sunday School',
    match: (s) =>
      /how-to-explain|christian-|screen-time|devotion|sunday-school|lesson|teacher|family|advent|christmas-gift|gift-guide/.test(s),
  },
  stories: { title: 'Bible Stories for Kids', match: () => true }, // catch-all, checked last
}

// Stable pseudo-shuffle so the drip mixes topics instead of going A-Z
function slugHash(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ feed: string }> }) {
  const { feed } = await params
  const key = feed.replace(/\.xml$/, '')
  const def = FEEDS[key]
  if (!def) return new NextResponse('Not found', { status: 404 })

  const havePin = new Set(pinManifest as string[])
  const order = ['trivia', 'verses', 'parenting', 'stories']
  const clusterOf = (slug: string) => order.find((k) => FEEDS[k].match(slug)) || 'stories'

  const posts = getAllPosts()
    .filter((p) => havePin.has(p.slug) && clusterOf(p.slug) === key)
    .sort((a, b) => slugHash(a.slug) - slugHash(b.slug))

  const daysLive = Math.floor((Date.now() - LAUNCH) / 86400_000)
  const revealed = daysLive < 0 ? 0 : Math.min(posts.length, (daysLive + 1) * PER_DAY)

  const items = posts
    .slice(0, revealed)
    .map((p, i) => ({ post: p, pubDate: new Date(LAUNCH + Math.floor(i / PER_DAY) * 86400_000 + 16 * 3600_000) }))
    .slice(-MAX_ITEMS)
    .reverse() // newest first

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>${esc(def.title)} — Faithful Kids</title>
<link>${SITE}/blog</link>
<description>${esc(def.title)} from FaithfulKids.app — Bible learning for kids ages 7-15.</description>
${items
  .map(
    ({ post, pubDate }) => `<item>
<title>${esc(post.title)}</title>
<link>${SITE}/blog/${post.slug}</link>
<guid isPermaLink="true">${SITE}/blog/${post.slug}</guid>
<description>${esc(post.metaDescription || post.title)}</description>
<pubDate>${pubDate.toUTCString()}</pubDate>
<media:content url="${CDN}/pin-images/${post.slug}.jpg" medium="image" />
<enclosure url="${CDN}/pin-images/${post.slug}.jpg" type="image/jpeg" length="300000" />
</item>`
  )
  .join('\n')}
</channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
