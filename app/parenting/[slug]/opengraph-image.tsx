import { ImageResponse } from 'next/og'
import { getPublicArticles, getPublicArticle, getSection } from '@/lib/parenting'

/*
 * Social card for every /parenting/<slug> page.
 *
 * Articles WITH a hero photograph already declare it as og:image in metadata
 * (a photo previews better than a card), so this route is the card for pages
 * without one: section pages, and any article whose photo is missing. It is
 * typographic by design: the headline, the byline, the wordmark. No stock
 * photo is ever invented for a piece that has none.
 */
export const runtime = 'nodejs'
export const alt = 'Raising Faithful Kids'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return getPublicArticles().map(a => ({ slug: a.slug }))
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const section = getSection(slug)
  const article = section ? undefined : getPublicArticle(slug)
  const kicker = section ? section.label : article?.section.label || 'Parenting'
  const title = section ? section.title : article?.title || 'Raising Faithful Kids'
  const byline = article ? `By ${article.author.name}` : 'Real stories, thoughtful perspectives, and practical wisdom'
  const big = title.length < 60

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: '#fbf7f0', padding: '64px 72px', fontFamily: 'Georgia, "Times New Roman", serif', color: '#16314f',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#3f5a77' }}>
          <span style={{ fontWeight: 700 }}>Faithful Kids</span>
          <span style={{ color: '#c9c3b8' }}>/</span>
          <span style={{ color: '#15803d', fontWeight: 700 }}>Parenting</span>
          <span style={{ color: '#c9c3b8' }}>/</span>
          <span>{kicker}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: big ? 68 : 54, lineHeight: 1.08, fontWeight: 600, letterSpacing: -1.5, maxWidth: 1000, display: 'flex' }}>{title}</div>
          <div style={{ marginTop: 28, fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 26, color: '#3f5a77', display: 'flex' }}>{byline}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '3px solid #16314f', paddingTop: 22, fontFamily: 'Helvetica, Arial, sans-serif' }}>
          <div style={{ fontSize: 30, fontWeight: 700, display: 'flex' }}>Raising Faithful Kids</div>
          <div style={{ fontSize: 22, color: '#15803d', fontWeight: 700, display: 'flex' }}>faithfulkids.app/parenting</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
