import type { MetadataRoute } from 'next'
import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import { COLORING_PAGES } from '@/lib/coloring-pages'
import wordSearches from '@/lib/word-searches.json'
import crosswords from '@/lib/crosswords.json'
import jesseTree from '@/lib/jesse-tree.json'
import { GUIDE_CATEGORIES, getGuideCategory } from '@/lib/guide-categories'
import { HOLIDAYS, MIN_POSTS } from '@/lib/holidays'
import { MAPS as bibleMaps } from '@/lib/bible-maps'
import { getPublicArticles, getPublicAuthors, liveSections } from '@/lib/parenting'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://faithfulkids.app'
  const posts = getAllPosts()
  const series = getAllSeriesNames()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date('2026-04-10'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2026-04-10'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // /checkout is deliberately absent: it is Disallowed in robots.txt and
    // noindexed — listing it in the sitemap contradicted both signals
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date('2026-04-10'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      // Canonical facts page (pricing, ages, safety) — written for answer
      // engines; the page LLMs should cite for "what is Faithful Kids".
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-09-21'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      // Statement of faith. Homeschool-group leaders ask for this before
      // recommending us, so it has to be findable rather than emailed on
      // request. /what-we-believe and /statement-of-faith redirect here.
      url: `${baseUrl}/beliefs`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      // Every price and trial length, every platform, with Offer schema. Exists
      // because engines invented prices when there was no page to retrieve.
      url: `${baseUrl}/pricing`,
      lastModified: new Date('2026-09-21'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      // Founder / author entity page. Carries the one canonical Person node
      // (sameAs -> his Christian Post author archive) that the Organization
      // references as `founder`. Linked from /about so it is not orphaned.
      url: `${baseUrl}/about/christian-alexander`,
      lastModified: new Date('2026-09-02'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      // Hub for "bible stories for kids" (1,479/mo). Priority matches the
      // homepage because this is the primary organic target, not a side page.
      url: `${baseUrl}/bible-stories-for-kids`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bible-quiz`,
      lastModified: new Date('2026-10-03'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bible-jeopardy`,
      lastModified: new Date('2026-10-29'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bible-trivia`,
      lastModified: new Date('2026-08-16'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/churches`,
      lastModified: new Date('2026-08-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      // Curated children's-ministry resource hub (Nov 2026). Low-volume,
      // high-authority space — judge by referring domains + church signups.
      url: `${baseUrl}/churches/resources`,
      lastModified: new Date('2026-11-03'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: new Date('2026-10-07'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/homeschool`,
      lastModified: new Date('2026-08-31'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/printables`,
      lastModified: new Date('2026-08-16'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      // "bible coloring pages" 5,400/mo at KD 5 -- the lowest-difficulty
      // high-volume term found in the whole niche scan.
      url: `${baseUrl}/printables/bible-coloring-pages`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: COLORING_PAGES.map(c => `https://d3g07v1w0lehiv.cloudfront.net/coloring-pages/${c.slug}.png`),
    },
    {
      // "religious easter coloring pages" 1,900/mo KD 0
      url: `${baseUrl}/printables/easter-coloring-pages`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: COLORING_PAGES.filter(c => c.season === 'easter').map(c => `https://d3g07v1w0lehiv.cloudfront.net/coloring-pages/${c.slug}.png`),
    },
    {
      // "nativity coloring pages" 1,632/mo KD 0
      url: `${baseUrl}/printables/christmas-coloring-pages`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: COLORING_PAGES.filter(c => c.season === 'christmas').map(c => `https://d3g07v1w0lehiv.cloudfront.net/coloring-pages/${c.slug}.png`),
    },
    {
      // "bible word search puzzles" 5,400/mo KD 4
      url: `${baseUrl}/printables/bible-word-search`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: wordSearches.map(w => `https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${w.slug}.png`),
    },
    ...wordSearches.filter(w => w.slug !== 'bible').map(w => ({
      url: `${baseUrl}/printables/bible-word-search/${w.slug}`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [`https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${w.slug}.png`],
    })),
    {
      // "bible crossword puzzles" 2,400/mo KD 10
      url: `${baseUrl}/printables/bible-crossword`,
      lastModified: new Date('2026-10-03'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: crosswords.map(w => `https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${w.slug}.png`),
    },
    ...crosswords.filter(w => w.slug !== 'bible').map(w => ({
      url: `${baseUrl}/printables/bible-crossword/${w.slug}`,
      lastModified: new Date('2026-10-03'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [`https://d3g07v1w0lehiv.cloudfront.net/wordsearch-images/${w.slug}.png`],
    })),
    ...COLORING_PAGES.map(c => ({
      url: `${baseUrl}/printables/bible-coloring-pages/${c.slug}`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [`https://d3g07v1w0lehiv.cloudfront.net/coloring-pages/${c.slug}.png`],
    })),
    {
      // "jesse tree" 3,060/mo clickstream; artifact SERP (ornaments printable) has no AIO
      url: `${baseUrl}/printables/jesse-tree`,
      lastModified: new Date('2026-09-03'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: [
        'https://d3g07v1w0lehiv.cloudfront.net/jesse-tree/hero.png',
        ...jesseTree.map(d => `https://d3g07v1w0lehiv.cloudfront.net/jesse-tree/${d.slug}.png`),
      ],
    },
    {
      // "bible map" 1,376/mo clickstream KD 18; detail pages each own a KD 0-10
      // term (ancient israel map, map of israel in jesus time, exodus, Paul's
      // journeys, 12 tribes, canaan). Artifact SERPs with empty AI Overviews.
      url: `${baseUrl}/printables/bible-maps`,
      lastModified: new Date('2026-11-02'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...bibleMaps.map(m => ({
      url: `${baseUrl}/printables/bible-maps/${m.slug}`,
      lastModified: new Date('2026-11-02'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      // "bible timeline" 2,956/mo clickstream (9,900 ads) KD 15
      url: `${baseUrl}/printables/bible-timeline`,
      lastModified: new Date('2026-11-02'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/printables/valentine-bible-verse-cards`,
      lastModified: new Date('2026-10-29'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/printables/books-of-the-bible`,
      lastModified: new Date('2026-10-29'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/printables/advent-bible-calendar`,
      lastModified: new Date('2026-09-03'),
      changeFrequency: 'monthly',
      priority: 0.8,
      images: ['https://d3g07v1w0lehiv.cloudfront.net/jesse-tree/advent-hero.png'],
    },
    {
      url: `${baseUrl}/printables/bible-trivia-pack`,
      lastModified: new Date('2026-08-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/printables/30-day-challenge`,
      lastModified: new Date('2026-08-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/printables/bedtime-bible-kit`,
      lastModified: new Date('2026-08-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date('2026-04-10'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-04-10'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-04-10'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const seriesPages: MetadataRoute.Sitemap = series.map(s => ({
    url: `${baseUrl}/blog/series/${s.slug}`,
    lastModified: new Date('2026-04-10'),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified + 'T00:00:00Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    images: [`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`],
  }))

  // Topic hub pages — only categories that actually contain guide posts
  const guidePosts = posts.filter(p => !p.series)
  const topicPages: MetadataRoute.Sitemap = GUIDE_CATEGORIES.filter(c =>
    guidePosts.some(p => getGuideCategory(p.slug) === c.name)
  ).map(c => ({
    url: `${baseUrl}/blog/topics/${c.slug}`,
    lastModified: new Date('2026-08-15'),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Seasonal hubs. Only those with real content — an empty hub is thin
  // content, and MIN_POSTS is enforced in the route too, so a hub omitted
  // here would 404 if it were listed.
  const liveHolidays = HOLIDAYS.filter(
    h => posts.filter(p => h.match.test(p.slug)).length >= MIN_POSTS
  )
  const holidayPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/holidays`,
      lastModified: new Date('2026-09-11'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    ...liveHolidays.map(h => ({
      url: `${baseUrl}/holidays/${h.slug}`,
      lastModified: new Date('2026-09-11'),
      changeFrequency: 'monthly' as const,
      // Seasonal demand is enormous but concentrated: "christmas word search"
      // runs 14,800/mo on average and 165,000 in December.
      priority: 0.8,
    })),
  ]

  // Parenting: the editorial section. Samples (development placeholders) are
  // never public in production and never listed. Category pages appear only
  // once they have content, the same rule as the blog topic hubs.
  const pArticles = getPublicArticles().filter(a => !a.isSample)
  const parentingPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/parenting`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/parenting/write-for-us`, lastModified: new Date('2026-11-03'), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/parenting/about`, lastModified: new Date('2026-11-03'), changeFrequency: 'yearly' as const, priority: 0.4 },
    { url: `${baseUrl}/parenting/editorial-policy`, lastModified: new Date('2026-11-03'), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/parenting/submission-guidelines`, lastModified: new Date('2026-11-03'), changeFrequency: 'yearly' as const, priority: 0.3 },
    ...liveSections(pArticles).map(s => ({ url: `${baseUrl}/parenting/${s.slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...pArticles.map(a => ({
      url: `${baseUrl}/parenting/${a.slug}`,
      lastModified: new Date(a.dateModified + 'T00:00:00Z'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      ...(a.image ? { images: [a.image] } : {}),
    })),
    ...getPublicAuthors().filter(au => pArticles.some(a => a.authorSlug === au.slug)).map(au => ({
      url: `${baseUrl}/parenting/authors/${au.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5,
    })),
  ]

  return [...staticPages, ...holidayPages, ...seriesPages, ...topicPages, ...blogPages, ...parentingPages]
}
