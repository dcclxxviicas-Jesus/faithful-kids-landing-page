'use client'

import { useState } from 'react'

interface PostCard {
  title: string
  slug: string
  series: string
  seriesSlug: string
  episode: number
  book: string
  themes: string
  metaDescription: string
  age: string
}

interface SeriesInfo {
  name: string
  slug: string
  count: number
}

// Categorize guide posts by slug pattern
function getGuideCategory(slug: string): string {
  if (slug.startsWith('bible-verses-') || slug.startsWith('short-bible-verses') || slug.startsWith('goodnight-bible-verses')) return 'Bible Verses'
  if (slug.startsWith('who-was-')) return 'Bible Characters'
  if (slug.startsWith('how-to-explain-')) return 'How to Explain'
  if (slug.startsWith('bible-stories-about-') || slug === 'bible-stories-with-moral-lessons-for-kids') return 'Bible Themes'
  if (slug.startsWith('bible-stories-for-') || slug === 'best-bible-stories-for-kids') return 'By Age'
  if (slug.includes('screen-time') || slug.includes('digital-stewardship') || slug.includes('christian-alternatives')) return 'Screen Time'
  if (slug.includes('-vs-') || slug.includes('best-bible-app') || slug.includes('free-bible-apps') || slug.includes('best-educational') || slug.includes('best-bible-apps') || slug === 'bible-app-for-kids-review') return 'App Reviews'
  if (slug.includes('sunday-school') || slug.includes('homeschool') || slug.includes('lesson-plan') || slug.includes('memory-verse') || slug.includes('bible-study-group') || slug.includes('discussion-questions') || slug.includes('curriculum')) return 'Teaching'
  if (slug.includes('holy-week') || slug.includes('advent') || slug.includes('thanksgiving') || slug.includes('christmas') || slug.includes('easter') || slug.includes('lent') || slug.includes('new-year') || slug.includes('back-to-school') || slug.includes('summer')) return 'Seasonal'
  if (slug.includes('trivia') || slug.includes('riddles') || slug.includes('jokes') || slug.includes('games') || slug.includes('word-search') || slug.includes('coloring') || slug.includes('crafts') || slug.includes('fun-facts')) return 'Activities'
  if (slug.includes('family') || slug.includes('devotions') || slug.includes('bible-time') || slug.includes('30-day') || slug.includes('dinner')) return 'Family'
  if (slug.includes('parenting') || slug.includes('godly-kids') || slug.includes('pray-with') || slug.includes('church-fun') || slug.includes('podcast') || slug.includes('when-should')) return 'Parenting'
  if (slug.includes('book-of-') || slug.includes('books-of-') || slug.includes('commandments') || slug.includes('lords-prayer') || slug.includes('beatitudes') || slug.includes('fruit-of-the-spirit') || slug.includes('gospel')) return 'Bible Books'
  if (slug.includes('salvation') || slug.includes('death') || slug.includes('bad-things') || slug.includes('bullying') || slug.includes('divorce') || slug.includes('sickness') || slug.includes('anxious') || slug.includes('healing')) return 'Life Questions'
  return 'Guides'
}

export default function BlogGrid({
  posts,
  seriesList,
}: {
  posts: PostCard[]
  seriesList: SeriesInfo[]
}) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const guidePosts = posts.filter(p => !p.series)
  const storyPosts = posts.filter(p => !!p.series)

  // Build guide categories
  const guideCats = new Map<string, PostCard[]>()
  for (const p of guidePosts) {
    const cat = getGuideCategory(p.slug)
    if (!guideCats.has(cat)) guideCats.set(cat, [])
    guideCats.get(cat)!.push(p)
  }
  const guideCatList = Array.from(guideCats.entries()).sort((a, b) => b[1].length - a[1].length)

  // Filter logic
  let filtered: PostCard[]
  if (activeFilter === 'all') {
    filtered = [...storyPosts, ...guidePosts]
  } else if (activeFilter === 'all-guides') {
    filtered = guidePosts
  } else if (activeFilter.startsWith('guide:')) {
    const cat = activeFilter.replace('guide:', '')
    filtered = guideCats.get(cat) || []
  } else {
    filtered = storyPosts.filter(p => p.seriesSlug === activeFilter)
  }

  const filterLabel = activeFilter === 'all' ? null
    : activeFilter === 'all-guides' ? 'Guides'
    : activeFilter.startsWith('guide:') ? activeFilter.replace('guide:', '')
    : seriesList.find(s => s.slug === activeFilter)?.name

  return (
    <>
      {/* Filter tabs */}
      <div className="blog-filters-scroll">
        <div className="blog-filters">
          <button
            className={`blog-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>

          {/* Bible Series */}
          {seriesList.map(s => (
            <button
              key={s.slug}
              className={`blog-filter-tab ${activeFilter === s.slug ? 'active' : ''}`}
              onClick={() => setActiveFilter(s.slug)}
            >
              {s.name}
            </button>
          ))}

          {/* Divider */}
          {guidePosts.length > 0 && <span className="blog-filter-divider" />}

          {/* Guide categories */}
          {guideCatList.map(([cat, catPosts]) => (
            <button
              key={cat}
              className={`blog-filter-tab blog-filter-tab-guide ${activeFilter === `guide:${cat}` ? 'active' : ''}`}
              onClick={() => setActiveFilter(`guide:${cat}`)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post count */}
      <p className="blog-result-count">
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
        {filterLabel && <> in <strong>{filterLabel}</strong></>}
      </p>

      {/* Grid */}
      <div className="blog-grid">
        {filtered.map(post => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`}
              alt={post.title}
              width={896}
              height={512}
              loading="lazy"
              className="blog-card-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="blog-card-body">
              <div className="blog-card-header">
                {post.series
                  ? <span className="blog-card-badge">{post.series}</span>
                  : <span className="blog-card-badge blog-card-badge-guide">{getGuideCategory(post.slug)}</span>
                }
              </div>
              <h3 className="blog-card-title">{post.title.split(':')[0]}</h3>
              {post.book && <p className="blog-card-book">{post.book}</p>}
              <span className="blog-card-link">Read &rarr;</span>
            </div>
          </a>
        ))}
      </div>
    </>
  )
}
