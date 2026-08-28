import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import {
  getAllPosts,
  getPostBySlug,
  getPostsBySeriesSlug,
  extractFaqFromContent,
  extractDiscussionQuestions,
  extractTriviaQuestions,
  getReadingTime,
  getHeroStoryLinks,
  getRelatedGuides, triviaLabel, getRelatedTrivia } from '@/lib/blog'
import { notFound } from 'next/navigation'
import { BlogImage } from '../BlogImage'
import { TriviaGame } from '../TriviaGame'
import { BlogStickyCta } from '../BlogStickyCta'
import { BlogExitIntent } from '../BlogExitIntent'
import { EmailCaptureCard } from '../EmailCaptureCard'
import { StoryLesson } from '../StoryLesson'
import storyQuizzes from '@/lib/story-quizzes.json'
import storyDurations from '@/lib/story-durations.json'
import triviaVideos from '@/lib/trivia-videos.json'
import guideVideos from '@/lib/guide-videos.json'
import { PrintableCta } from '@/app/printables/PrintableCta'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not Found' }

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://faithfulkids.app/blog/${post.slug}`,
      siteName: 'Faithful Kids',
      type: 'article',
      images: [{
        url: `https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`,
        width: 1792,
        height: 1024,
        alt: `${post.title} - Bible Story Illustration`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`],
    },
    alternates: {
      canonical: `https://faithfulkids.app/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  // Story posts: siblings from the same series. Guides (no series): topically
  // related guides — an empty seriesSlug would otherwise match ALL guides.
  const relatedPosts = (post.seriesSlug
    ? getPostsBySeriesSlug(post.seriesSlug).filter(p => p.slug !== post.slug)
    : getRelatedGuides(post)
  ).slice(0, 6)

  const readingTime = getReadingTime(post.content)
  const triviaQuestions = extractTriviaQuestions(post.content)
  const faqs = extractFaqFromContent(post.content)
  const discussionQuestions = extractDiscussionQuestions(post.content)
  const heroStories = getHeroStoryLinks(post.slug, post.seriesSlug)

  // Use only real FAQ items (not discussion questions) for FAQPage schema
  const faqItems = faqs

  // JSON-LD Article schema (enhanced for AEO)
  const titleWithoutForKids = post.title.replace(/ for Kids.*$/, '')
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: `https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`,
    author: { '@type': 'Person', name: 'Faithful Kids Team' },
    publisher: {
      '@type': 'Organization',
      name: 'Faithful Kids',
      url: 'https://faithfulkids.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://faithfulkids.app/logo.png',
      },
    },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    keywords: post.keywords,
    mainEntityOfPage: `https://faithfulkids.app/blog/${post.slug}`,
    inLanguage: 'en-US',
    wordCount: post.content.split(/\s+/).length,
    educationalLevel: 'beginner',
    audience: { '@type': 'EducationalAudience', educationalRole: 'parent' },
    ...(post.series ? { isPartOf: { '@type': 'CreativeWorkSeries', name: `${post.series} - Faithful Kids Bible Series` } } : {}),
    about: { '@type': 'Thing', name: `${titleWithoutForKids} Bible Story` },
  }

  // FAQ schema — uses extracted FAQ section only
  const faqJsonLd = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null

  // VideoObject schema — real CDN video URL (verified live for all 200 episode
  // posts), real hero thumbnail, real publish date. No fabricated duration.
  // Free lesson media. Same CDN paths the VideoObject schema uses — all 200
  // video and caption URLs HEAD-verified 200 on 2026-08-26.
  const isStory = Boolean(post.seriesSlug && post.episode)
  const mediaBase = isStory
    ? `https://d3g07v1w0lehiv.cloudfront.net/bible/${post.seriesSlug}-series/${String(post.episode).padStart(2, '0')}-${post.slug.replace(/-for-kids$/, '')}`
    : ''
  const lessonQuestions = (storyQuizzes as Record<string, { q: string; options: string[]; correct: number; why: string }[]>)[post.slug] || []
  // Real runtime read from the file with ffprobe (all 200: 1:28-3:37, median
  // 2:07). Never estimated -- the old copy claimed "60-second" and was wrong.
  const durSecs = (storyDurations as Record<string, number>)[post.slug]
  const lessonDuration = durSecs
    ? `${Math.floor(durSecs / 60)}:${String(durSecs % 60).padStart(2, '0')}`
    : undefined

  const videoJsonLd = post.videoUrl && post.seriesSlug && post.episode
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: `${post.title} — Bible Story Video`,
        description: post.metaDescription,
        thumbnailUrl: `https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`,
        uploadDate: post.datePublished,
        contentUrl: `https://d3g07v1w0lehiv.cloudfront.net/bible/${post.seriesSlug}-series/${String(post.episode).padStart(2, '0')}-${post.slug.replace(/-for-kids$/, '')}/lesson-video.mp4`,
        publisher: { '@type': 'Organization', name: 'Faithful Kids' },
        educationalLevel: 'beginner',
        inLanguage: 'en',
      }
    : null

  // BreadcrumbList schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://faithfulkids.app/blog' },
      ...(post.series ? [{ '@type': 'ListItem', position: 3, name: post.series, item: `https://faithfulkids.app/blog/series/${post.seriesSlug}` }] : []),
      { '@type': 'ListItem', position: post.series ? 4 : 3, name: post.title.split(':')[0] },
    ],
  }

  // ImageObject schema for hero image
  const imageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: `https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`,
    name: `${post.title} - Bible Story Illustration for Kids`,
    description: post.metaDescription,
    width: 1792,
    height: 1024,
    representativeOfPage: true,
    creator: { '@type': 'Organization', name: 'Faithful Kids' },
  }

  // Split content to inject mid-article CTA
  const contentParts = splitContentForCTA(post.content)
  const secondParts = splitSecondForImage(contentParts.second)

  // Real-episode match for the mid-article CTA (see the TRUTH RULE comment at
  // the render site). Only guides are ever in this map.
  const guideVideo = !isStory
    ? (guideVideos as Record<string, { videoSrc: string; posterSrc: string; videoTitle: string; storySlug: string }>)[slug]
    : undefined
  const introParts = splitIntro(contentParts.first)

  // Exit-intent popup: context-aware variant (drives which free printable
  // it offers). No video -- the popup's job is one low-friction ask.
const hasTriviaGame = triviaQuestions.length >= 10
  const exitVariant: 'trivia' | 'story' | 'guide' =
    post.slug.includes('trivia') ? 'trivia' : post.type !== 'listicle' ? 'story' : 'guide'

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {videoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* NAV */}
      <SiteNav active="blog" />

      {/* Exit-intent popup (renders nothing until triggered) */}
      <BlogExitIntent postSlug={post.slug} variant={exitVariant} />

      {/* MAIN CONTENT */}
      <main>

      {/* BREADCRUMB */}
      <div className="blog-breadcrumb">
        <a href="/blog">Blog</a>
        <span className="blog-breadcrumb-sep">/</span>
        {post.series ? (
          <>
            <a href={`/blog/series/${post.seriesSlug}`}>{post.series}</a>
            <span className="blog-breadcrumb-sep">/</span>
          </>
        ) : null}
        <span className="blog-breadcrumb-current">{post.title.split(':')[0]}</span>
      </div>

      {/* HERO IMAGE */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <BlogImage
          src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${slug}-hero.webp`}
          alt={`${post.title} - Bible Story Illustration for Kids`}
          width={1792}
          height={1024}
          fetchPriority="high"
          style={{ width: '100%', height: 'auto', borderRadius: '16px', marginBottom: '24px' }}
        />
      </div>

      {/* ARTICLE */}
      <article className="blog-article">
        {/* Header */}
        <header className="blog-article-header">
          <div className="blog-article-meta-row">
            {post.series && <span className="blog-card-badge">{post.series}</span>}
            {!post.series && post.type === 'listicle' && <span className="blog-card-badge">Guide</span>}
            {post.book && (
              <>
                <span className="blog-article-meta-sep">&middot;</span>
                <span className="blog-article-meta-text">{post.book}</span>
              </>
            )}
            {post.scripture && (
              <>
                <span className="blog-article-meta-sep">&middot;</span>
                <span className="blog-article-meta-text">{post.scripture}</span>
              </>
            )}
          </div>
          <h1 className="blog-article-title">{post.title}</h1>
          <div className="blog-article-info">
            <span>{post.age}</span>
            <span>&middot;</span>
            <span>{readingTime} min read</span>
            <span>&middot;</span>
            <span>{post.testament}</span>
            <span>&middot;</span>
            <span>By Faithful Kids Team</span>
            <span>&middot;</span>
            <span>Updated {new Date(post.dateModified + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {post.themes && (
            <div className="blog-article-themes">
              {post.themes.split(',').slice(0, 5).map(t => (
                <span key={t.trim()} className="blog-theme-pill">{t.trim()}</span>
              ))}
            </div>
          )}
        </header>

        {isStory && (
          <StoryLesson
            videoUrl={`${mediaBase}/lesson-video.mp4`}
            posterUrl={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`}
            captionsUrl={`${mediaBase}/lesson-captions.vtt`}
            storyName={post.title.split(':')[0].replace(/ for Kids$/i, '')}
            questions={lessonQuestions}
            slug={post.slug}
            duration={lessonDuration}
          />
        )}

        {/* Body — first half */}
        {hasTriviaGame ? (
          <>
            {/* Intro only, then the game. Someone searching "bible trivia for
                teens" wants to PLAY trivia -- making them read fifty questions
                first buried the one interactive thing on the page. */}
            <div
              className="blog-article-body"
              dangerouslySetInnerHTML={{ __html: introParts.intro }}
            />
            <TriviaGame
              questions={triviaQuestions}
              postSlug={post.slug}
              postTitle={post.title}
              label={triviaLabel(post.slug, post.title)}
              related={getRelatedTrivia(post.slug)}
              posterSrc={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${post.slug}-hero.webp`}
              {...getTriviaVideo(post.slug)}
            />
            <div
              className="blog-article-body"
              dangerouslySetInnerHTML={{ __html: introParts.rest }}
            />
          </>
        ) : (
          <div
            className="blog-article-body"
            dangerouslySetInnerHTML={{ __html: contentParts.first }}
          />
        )}

        {/* Inline image 1 — after first content section */}
        <BlogImage
          src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${slug}-1.webp`}
          alt={`Illustration from ${post.title}`}
          width={1024}
          height={1024}
          loading="lazy"
          style={{ width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '12px', margin: '24px auto', display: 'block' }}
        />



        {/* Mid-article CTA — skipped when the game is present, since the
            game's end screen already makes the same offer with a video.
            Also skipped on story posts: the free lesson above already showed
            the video and ran the quiz, so repeating "watch this story" here
            would contradict the page.

            TRUTH RULE (Aug 28, 2026): this block used to interpolate the
            guide's own title into "See {title} in a short narrated video
            lesson" on 241 pages where no such video exists — which is exactly
            how a paying customer bought a video that wasn't there. Now:
            - If lib/guide-videos.json maps this guide to a REAL episode
              (every entry validated against the story post and HEAD-verified
              on the CDN before it shipped), we show that episode by name and
              PLAY it here, PrintableCta-style.
            - Otherwise the copy promises only what is true: the app's 300+
              lessons, no title interpolation. Button says "free trial" with
              no number (annual-only 3-day trial; the standing no-stale-claim
              rule). */}
        {!hasTriviaGame && !isStory && guideVideo && (
          <PrintableCta
            videoSrc={guideVideo.videoSrc}
            posterSrc={guideVideo.posterSrc}
            videoTitle={guideVideo.videoTitle}
            heading={`Watch ${guideVideo.videoTitle} Come Alive`}
            body={`${guideVideo.videoTitle} is one of 300+ short narrated video lessons your child will love. Watch the whole episode right here — in the app, every lesson ends with a fun quiz to check what they learned.`}
            source="guide-mid-cta"
          />
        )}
        {!hasTriviaGame && !isStory && !guideVideo && (
          <div className="blog-mid-cta">
            <div className="blog-mid-cta-icon">&#9654;</div>
            <h3>Bring the Bible to Life</h3>
            <p>
              Faithful Kids turns the whole Bible into <strong>300+ short narrated video
              lessons</strong> kids love, Genesis to Revelation — each followed by a fun quiz to
              check what they learned.
            </p>
            <a href="/quiz" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Start your free trial
            </a>
          </div>
        )}

        {/* Second half, part A — text between the two illustrations so they
            never stack directly on top of each other. */}
        {secondParts.a && (
          <div
            className="blog-article-body"
            dangerouslySetInnerHTML={{ __html: secondParts.a }}
          />
        )}

        {/* Inline image 2 */}
        {contentParts.second && (
          <BlogImage
            src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${slug}-2.webp`}
            alt={`${post.title} - Key Moment Illustration`}
            width={1024}
            height={1024}
            loading="lazy"
            style={{ width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '12px', margin: '24px auto', display: 'block' }}
          />
        )}

        {/* Body — second half */}
        {contentParts.second && (
          <div
            className="blog-article-body"
            dangerouslySetInnerHTML={{ __html: secondParts.b || contentParts.second }}
          />
        )}
        {/* Email capture — magnet matched to page type */}
        <EmailCaptureCard
          magnet={exitVariant === 'trivia' ? 'trivia-pack' : 'bedtime-kit'}
          source="blog-inline"
          sourcePost={post.slug}
        />
      </article>

      {/* RELATED POSTS */}
      {relatedPosts.length > 0 && (
        <section className="blog-related">
          <h2>{post.series ? `More from the ${post.series} Series` : 'Related Guides'}</h2>
          <div className="blog-related-grid">
            {relatedPosts.map(rp => (
              <a key={rp.slug} href={`/blog/${rp.slug}`} className="blog-card blog-card-compact">
                <img
                  src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${rp.slug}-hero.webp`}
                  alt={`${rp.title} - Bible Story Illustration`}
                  width={1792}
                  height={1024}
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', borderRadius: '12px 12px 0 0' }}
                />
                <div className="blog-card-header">
                  <span className="blog-card-badge">{rp.series || 'Guide'}</span>
                </div>
                <h3 className="blog-card-title">{rp.title.split(':')[0]}</h3>
                <p className="blog-card-book">
                  {rp.book && <>{rp.book} &middot; </>}{rp.age}
                </p>
                <span className="blog-card-link">Read More &rarr;</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* RELATED STORIES FROM OTHER SERIES */}
      {heroStories.length > 0 && (
        <section className="blog-related">
          <h2>Related Bible Stories</h2>
          <div className="blog-related-grid">
            {heroStories.map(story => (
              <a key={story.slug} href={`/blog/${story.slug}`} className="blog-card blog-card-compact">
                <img
                  src={`https://d3g07v1w0lehiv.cloudfront.net/blog-images/${story.slug}-hero.webp`}
                  alt={`${story.title} - Bible Story Illustration`}
                  width={1792}
                  height={1024}
                  loading="lazy"
                  style={{ width: '100%', height: 'auto', borderRadius: '12px 12px 0 0' }}
                />
                <div className="blog-card-header">
                  <span className="blog-card-badge">{story.series}</span>
                </div>
                <h3 className="blog-card-title">{story.title.split(':')[0]}</h3>
                <p className="blog-card-desc">{story.metaDescription}</p>
                <span className="blog-card-link">Read Story &rarr;</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* BOTTOM CTA */}
      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>Start Your Child's Bible Journey</h2>
          <p>
            500+ narrated video lessons. Comprehension quizzes after every story.
            From Genesis to Revelation — safe, ad-free, and made for kids.
          </p>
          <a href="/quiz" className="btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Try Faithful Kids Free for 3 Days
          </a>
          <div className="blog-cta-badges">
            <span>No ads, ever</span>
            <span>30-day money-back guarantee</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* STICKY BOTTOM CTA */}
      <BlogStickyCta postSlug={post.slug} />

      </main>

      {/* FOOTER */}
      <SiteFooter />
    </>
  )
}

/**
 * Pick the course-preview video for the trivia game end screen.
 * Old Testament book trivia gets the Creation lesson; everything else gets
 * the flagship "An Angel Visits Mary" lesson (same videos as the homepage).
 */
function getTriviaVideo(slug: string): { videoSrc: string; videoTitle: string } {
  // Matched per-post in build-trivia-videos.py, from the book the trivia is
  // actually about. This used to return one of only TWO videos for all 81
  // trivia pages, so Ruth trivia showed a Creation video. Now 38 distinct
  // videos; run that script after adding trivia posts.
  const hit = (triviaVideos as Record<string, { videoSrc: string; videoTitle: string }>)[slug]
  if (hit) return hit
  return {
    videoSrc: 'https://d3g07v1w0lehiv.cloudfront.net/bible/genesis-series/01-in-the-beginning-creation/lesson-video.mp4',
    videoTitle: 'In the Beginning: Creation',
  }
}

/**
 * Split content roughly in half at a heading boundary to insert a CTA in the middle.
 */
/**
 * Split the second content half after its first <h2> section, so inline image 2
 * can sit INSIDE it rather than immediately after image 1.
 *
 * Why: on story posts nothing renders between the two images (no trivia game,
 * and the mid-article CTA is skipped), so they stacked back to back. Two
 * illustrations with no text between them reads as a gallery, not an article.
 */
/**
 * Split off the article intro -- everything before the first <h2>.
 *
 * Used to place the playable trivia game directly under the intro. It had been
 * rendering after splitContentForCTA()'s first half, which on question-heavy
 * pages swallows every question section -- so the game, the single most
 * engaging thing on the page, sat below fifty questions of plain text where
 * nobody scrolled to find it.
 */
function splitIntro(html: string): { intro: string; rest: string } {
  const i = html.indexOf('<h2>')
  if (i === -1) return { intro: html, rest: '' }
  return { intro: html.slice(0, i), rest: html.slice(i) }
}

function splitSecondForImage(html: string): { a: string; b: string } {
  const positions: number[] = []
  const re = /<h2>/g
  let m
  while ((m = re.exec(html)) !== null) positions.push(m.index)
  if (positions.length < 2) return { a: html, b: '' }
  return { a: html.slice(0, positions[1]), b: html.slice(positions[1]) }
}

function splitContentForCTA(html: string): { first: string; second: string } {
  // Find all h2 positions
  const h2Positions: number[] = []
  const regex = /<h2>/g
  let match
  while ((match = regex.exec(html)) !== null) {
    h2Positions.push(match.index)
  }

  if (h2Positions.length < 3) {
    return { first: html, second: '' }
  }

  // Split after the 2nd or 3rd h2 (roughly middle of content)
  const splitIndex = h2Positions.length >= 5
    ? h2Positions[Math.floor(h2Positions.length / 2)]
    : h2Positions[2]

  return {
    first: html.slice(0, splitIndex),
    second: html.slice(splitIndex),
  }
}
