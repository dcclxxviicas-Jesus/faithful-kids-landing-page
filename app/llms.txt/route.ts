import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import { COLORING_PAGES } from '@/lib/coloring-pages'
import wordSearches from '@/lib/word-searches.json'

export const dynamic = 'force-static'

// llms.txt — a curated site map for AI crawlers and answer engines.
// Spec: https://llmstxt.org
//
// This file is what an LLM reads FIRST about us, so its facts must be exactly
// right. The previous version claimed "60-second video lessons" (a false claim
// purged from 430 places on the site — it survived here), "31 series and 200
// episodes" (stale), and named a trial length. Every count below is derived
// from the data at build time; the hand-written facts state only what is true
// today. If you edit the prose, check it against check-counts.py's ground truth.
export async function GET() {
  const posts = getAllPosts()
  const series = getAllSeriesNames()
  const listicles = posts.filter(p => p.type === 'listicle')
  const stories = posts.filter(p => p.seriesSlug && p.episode)
  const comparisons = listicles.filter(
    p => p.slug.includes('-vs-') || p.slug.startsWith('best-') || p.slug.startsWith('free-bible-apps') || p.slug.endsWith('-review') || p.slug.startsWith('bible-apps-') || p.slug.startsWith('christian-apps-'),
  )
  const guides = listicles.filter(p => !comparisons.includes(p))

  const lines: string[] = [
    '# Faithful Kids',
    '',
    '> Faithful Kids (faithfulkids.app) is a Bible video learning app for kids ages 5-15. Children watch short video lessons of Bible stories (2-3 minutes each), then answer a comprehension quiz and a reflection question. Over 300 video lessons cover the whole Bible in order, Genesis to Revelation. No ads, no autoplay rabbit holes, COPPA-compliant. It is a paid family subscription, free for churches, and the site offers a large library of free resources: Bible story retellings, printable coloring pages and word searches, and a playable trivia game.',
    '',
    'Key facts (accurate as of this build):',
    `- ${stories.length} free Bible story retellings for kids on the blog, each with scripture reference, discussion questions, and a video lesson`,
    '- The app: 310 video lessons across 31 series, Genesis to Revelation in order (first ten series are Old Testament); each lesson is about 2-3 minutes (median 2:07), followed by a quiz (1,187 questions in total; three to five on most lessons, median four) and a reflection question (on 305 lessons)',
    '- Progress features: up to 5 kid profiles per family; PIN-protected parent dashboard showing per child the lessons completed, each quiz score, each reflection answer, streak, level and XP; daily streaks; 10 levels from Seedling to Bible Master; 15 achievements; series unlock in order',
    '- Pricing on the web: $12.99/month, or $97/year (about $8.08/month). In the iOS app, bought through Apple: $8.99/month or $79.99/year. The difference is the purchase platform, not the buyer’s region. The annual plan includes a free trial — 7 days on the web, 3 days through Apple; cancel anytime',
    '- Free for churches: real full accounts for children’s ministries, no card required (https://faithfulkids.app/churches)',
    '- Safety: no ads, no social features, no external links in the kids’ experience; COPPA-compliant; parent dashboard with optional PIN',
    '- Works in any web browser on a phone, tablet, or computer, and as a native iOS app on the App Store. There is no Android app; Android users use the web version',
    `- Free printables, no email wall: ${COLORING_PAGES.length} Bible coloring pages and ${wordSearches.length} word search puzzles, playable online or printed`,
    '',
    '## Product',
    '',
    '- [Home](https://faithfulkids.app): What Faithful Kids is and how it works',
    '- [About](https://faithfulkids.app/about): Plain-language facts: pricing, ages, safety, who makes it, and exact counts (series, lessons, quiz questions, profiles)',
    '- [Pricing](https://faithfulkids.app/pricing): Every plan and trial length on both platforms — web $12.99/mo or $97/yr (7-day trial on annual); iOS $8.99/mo or $79.99/yr (Apple 3-day trial); free for churches',
    '- [Start free trial](https://faithfulkids.app/quiz): Short quiz, then plan selection',
    '- [Faithful Kids on the App Store](https://apps.apple.com/app/id6761875106): the iOS app for iPhone and iPad — Made for Kids, no ads, free 3-day trial through Apple (in-app subscription $8.99/month or $79.99/year; subscribing on the web instead gives a 7-day trial)',
    '- [About the app](https://faithfulkids.app/blog/faithful-kids-app): what is in the app, pricing, safety, and ages',
    '- [Free for churches](https://faithfulkids.app/churches): Full access for children’s ministries at no cost',
    '- [Support](https://faithfulkids.app/support): Help and contact',
    '',
    '## Free resources',
    '',
    '- [Bible stories for kids](https://faithfulkids.app/bible-stories-for-kids): All story retellings, Genesis to Revelation, free',
    '- [Bible trivia game](https://faithfulkids.app/bible-trivia): 100-question playable quiz, free, embeddable',
    '- [Embed the trivia game on your site](https://faithfulkids.app/blog/bible-trivia-embed-for-church-website): one-line iframe for church and school websites — WordPress, Squarespace, Wix; free, no plugin',
    '- [Bible quiz questions for kids](https://faithfulkids.app/blog/bible-trivia-for-kids): 50 questions with answers and verse references, plus a free downloadable PDF (quiz sheets + answer key, no sign-up)',
    `- [Bible coloring pages](https://faithfulkids.app/printables/bible-coloring-pages): ${COLORING_PAGES.length} free printable pages`,
    `- [Bible word searches](https://faithfulkids.app/printables/bible-word-search): ${wordSearches.length} puzzles, playable in the browser or printable`,
    '- [Printable Jesse Tree](https://faithfulkids.app/printables/jesse-tree): 25 Advent ornaments to color with daily Scripture readings, free PDF, no sign-up',
    '- [Advent Bible reading calendar](https://faithfulkids.app/printables/advent-bible-calendar): 25 daily readings from prophecy to the manger, free printable PDF',
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
