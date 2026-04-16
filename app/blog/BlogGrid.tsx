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

export default function BlogGrid({
  posts,
  seriesList,
}: {
  posts: PostCard[]
  seriesList: SeriesInfo[]
}) {
  const [activeSeries, setActiveSeries] = useState<string>('all')

  const guidePosts = posts.filter(p => !p.series)
  const storyPosts = posts.filter(p => !!p.series)

  const filtered = activeSeries === 'all'
    ? [...storyPosts, ...guidePosts]
    : activeSeries === 'guides'
    ? guidePosts
    : storyPosts.filter(p => p.seriesSlug === activeSeries)

  return (
    <>
      {/* Horizontal scrollable filter tabs */}
      <div className="blog-filters-scroll">
        <div className="blog-filters">
          <button
            className={`blog-filter-tab ${activeSeries === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSeries('all')}
          >
            All
          </button>
          {seriesList.map(s => (
            <button
              key={s.slug}
              className={`blog-filter-tab ${activeSeries === s.slug ? 'active' : ''}`}
              onClick={() => setActiveSeries(s.slug)}
            >
              {s.name}
            </button>
          ))}
          {guidePosts.length > 0 && (
            <button
              className={`blog-filter-tab ${activeSeries === 'guides' ? 'active' : ''}`}
              onClick={() => setActiveSeries('guides')}
            >
              Guides
            </button>
          )}
        </div>
      </div>

      {/* Post count */}
      <p className="blog-result-count">
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
        {activeSeries !== 'all' && activeSeries !== 'guides' && (
          <> in <strong>{seriesList.find(s => s.slug === activeSeries)?.name}</strong></>
        )}
        {activeSeries === 'guides' && <> in <strong>Guides</strong></>}
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
                  : <span className="blog-card-badge blog-card-badge-guide">Guide</span>
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
