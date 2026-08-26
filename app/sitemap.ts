import type { MetadataRoute } from 'next'
import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import { COLORING_PAGES } from '@/lib/coloring-pages'
import wordSearches from '@/lib/word-searches.json'
import { GUIDE_CATEGORIES, getGuideCategory } from '@/lib/guide-categories'

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
      // Hub for "bible stories for kids" (1,479/mo). Priority matches the
      // homepage because this is the primary organic target, not a side page.
      url: `${baseUrl}/bible-stories-for-kids`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'weekly',
      priority: 0.9,
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
    },
    {
      // "religious easter coloring pages" 1,900/mo KD 0
      url: `${baseUrl}/printables/easter-coloring-pages`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      // "nativity coloring pages" 1,632/mo KD 0
      url: `${baseUrl}/printables/christmas-coloring-pages`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      // "bible word search puzzles" 5,400/mo KD 4
      url: `${baseUrl}/printables/bible-word-search`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...wordSearches.filter(w => w.slug !== 'bible').map(w => ({
      url: `${baseUrl}/printables/bible-word-search/${w.slug}`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...COLORING_PAGES.map(c => ({
      url: `${baseUrl}/printables/bible-coloring-pages/${c.slug}`,
      lastModified: new Date('2026-08-26'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
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

  return [...staticPages, ...seriesPages, ...topicPages, ...blogPages]
}
