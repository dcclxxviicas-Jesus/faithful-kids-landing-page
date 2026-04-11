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

  const filtered = activeSeries === 'all'
    ? posts
    : posts.filter(p => p.seriesSlug === activeSeries)

  return (
    <>
      {/* Filter tabs */}
      <div className="blog-filters">
        <button
          className={`blog-filter-tab ${activeSeries === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSeries('all')}
        >
          All ({posts.length})
        </button>
        {seriesList.map(s => (
          <button
            key={s.slug}
            className={`blog-filter-tab ${activeSeries === s.slug ? 'active' : ''}`}
            onClick={() => setActiveSeries(s.slug)}
          >
            {s.name} ({s.count})
          </button>
        ))}
      </div>

      {/* Post count */}
      <p className="blog-result-count">
        {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
        {activeSeries !== 'all' && (
          <> in <strong>{seriesList.find(s => s.slug === activeSeries)?.name}</strong></>
        )}
      </p>

      {/* Grid */}
      <div className="blog-grid">
        {filtered.map(post => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
            <div className="blog-card-header">
              <span className="blog-card-badge">{post.series}</span>
              <span className="blog-card-episode">Ep. {post.episode}</span>
            </div>
            <h3 className="blog-card-title">{post.title}</h3>
            <p className="blog-card-book">
              {post.book && <>{post.book} &middot; </>}{post.age}
            </p>
            <p className="blog-card-desc">{post.metaDescription.slice(0, 140)}...</p>
            <div className="blog-card-themes">
              {post.themes.split(',').slice(0, 3).map(t => (
                <span key={t.trim()} className="blog-card-theme">{t.trim()}</span>
              ))}
            </div>
            <span className="blog-card-link">Read More &rarr;</span>
          </a>
        ))}
      </div>
    </>
  )
}
