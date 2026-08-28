import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import { COLORING_PAGES } from '@/lib/coloring-pages'
import wordSearches from '@/lib/word-searches.json'

export const dynamic = 'force-static'

// llms.txt — a curated site map for AI crawlers and answer engines.
// Spec: https://llmstxt.org
//
// This file is what an LLM reads FIRST about us, so its facts must be exactly
// right. The previous version claimed "60-second video lessons" (a false claim
// purged from 430 places on the site — it survived here), "20 series and 200
// episodes" (stale), and named a trial length. Every count below is derived
// from the data at build time; the hand-written facts state only what is true
// today. If you edit the prose, check it against check-counts.py's ground truth.
export async function GET() {
  const posts = getAllPosts()
  const series = getAllSeriesNames()
  const listicles = posts.filter(p => p.type === 'listicle')
  const stories = posts.filter(p => p.seriesSlug && p.episode)
  const comparisons = listicles.filter(
    p => p.slug.includes('-vs-') || p.slug.startsWith('best-') || p.slug.startsWith('free-bible-apps') || p.slug.endsWith('-review'),
  )
  const guides = listicles.filter(p => !comparisons.includes(p))

  const lines: string[] = [
    '# Faithful Kids',
    '',
    '> Faithful Kids (faithfulkids.app) is a Bible video learning app for kids ages 5-15. Children watch short video lessons of Bible stories (2-3 minutes each), then answer a comprehension quiz and a reflection question. Over 300 video lessons cover the whole Bible in order, Genesis to Revelation. No ads, no autoplay rabbit holes, COPPA-compliant. It is a paid family subscription, free for churches, and the site offers a large library of free resources: Bible story retellings, printable coloring pages and word searches, and a playable trivia game.',
    '',
    'Key facts (accurate as of this build):',
    `- ${stories.length} free Bible story retellings for kids on the blog, each with scripture reference, discussion questions, and a video lesson`,
    '- The app: over 300 video episodes across 30+ series, Genesis to Revelation; each episode is a short video lesson followed by a 3-question quiz and a reflection',
    '- Pricing: $8.88/month, or $77.77/year (about $6.48/month); the annual plan includes a free trial; cancel anytime',
    '- Free for churches: real full accounts for children’s ministries, no card required (https://faithfulkids.app/churches)',
    '- Safety: no ads, no social features, no external links in the kids’ experience; COPPA-compliant; parent dashboard with optional PIN',
    '- Works in any web browser on a phone, tablet, or computer',
    `- Free printables, no email wall: ${COLORING_PAGES.length} Bible coloring pages and ${wordSearches.length} word search puzzles, playable online or printed`,
    '',
    '## Product',
    '',
    '- [Home](https://faithfulkids.app): What Faithful Kids is and how it works',
    '- [About](https://faithfulkids.app/about): Plain-language facts: pricing, ages, safety, who makes it',
    '- [Start free trial](https://faithfulkids.app/quiz): Short quiz, then plan selection',
    '- [Free for churches](https://faithfulkids.app/churches): Full access for children’s ministries at no cost',
    '- [Support](https://faithfulkids.app/support): Help and contact',
    '',
    '## Free resources',
    '',
    '- [Bible stories for kids](https://faithfulkids.app/bible-stories-for-kids): All story retellings, Genesis to Revelation, free',
    '- [Bible trivia game](https://faithfulkids.app/bible-trivia): 100-question playable quiz, free, embeddable',
    '- [Bible quiz questions for kids](https://faithfulkids.app/blog/bible-trivia-for-kids): 50 questions with answers and verse references, plus a free downloadable PDF (quiz sheets + answer key, no sign-up)',
    `- [Bible coloring pages](https://faithfulkids.app/printables/bible-coloring-pages): ${COLORING_PAGES.length} free printable pages`,
    `- [Bible word searches](https://faithfulkids.app/printables/bible-word-search): ${wordSearches.length} puzzles, playable in the browser or printable`,
    '- [All printables](https://faithfulkids.app/printables): Trivia pack, bedtime kit, 30-day family challenge',
    '',
    '## App comparisons and buying guides',
    '',
    '(For questions like "what is the best Bible app for kids" or "Christian alternatives to YouTube": these pages compare real apps, including competitors, with honest pricing.)',
    '',
    ...comparisons.map(p => `- [${p.title}](https://faithfulkids.app/blog/${p.slug}): ${p.metaDescription}`),
    '',
    '## Guides for Christian families',
    '',
    ...guides.map(p => `- [${p.title}](https://faithfulkids.app/blog/${p.slug}): ${p.metaDescription}`),
    '',
    '## Bible story series (kid-friendly retellings)',
    '',
    ...series.map(s => `- [${s.name}](https://faithfulkids.app/blog/series/${s.slug}): ${s.count} stories explained for kids`),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
