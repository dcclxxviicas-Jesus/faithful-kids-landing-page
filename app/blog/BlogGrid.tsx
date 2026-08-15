'use client'

import { useState } from 'react'
import { getGuideCategory, getCategoryByName } from '@/lib/guide-categories'

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

// Category logic lives in lib/guide-categories.ts (shared with the
// /blog/topics/[category] hub pages)

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

          {/* Guide categories — crawlable links to the topic hub pages */}
          {guideCatList.map(([cat]) => {
            const hub = getCategoryByName(cat)
            return hub ? (
              <a
                key={cat}
                href={`/blog/topics/${hub.slug}`}
                className="blog-filter-tab blog-filter-tab-guide"
                style={{ textDecoration: 'none' }}
              >
                {cat}
              </a>
            ) : (
              <button
                key={cat}
                className={`blog-filter-tab blog-filter-tab-guide ${activeFilter === `guide:${cat}` ? 'active' : ''}`}
                onClick={() => setActiveFilter(`guide:${cat}`)}
              >
                {cat}
              </button>
            )
          })}
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
