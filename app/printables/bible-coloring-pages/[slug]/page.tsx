import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '../../../components/SiteChrome'
import PrintButton from '../../PrintButton'
import { COLORING_PAGES, getColoringPage, CDN } from '@/lib/coloring-pages'

/**
 * One page per coloring scene.
 *
 * Two reasons this exists rather than linking straight to the CDN image:
 *  - a raw .png on CloudFront is a dead end. No print button, no context, no
 *    way back into the site, and nothing for Google to rank.
 *  - every scene is its own keyword and every one measured at difficulty 0
 *    (see lib/coloring-pages.ts for the volumes). Sixteen pages at KD 0 beat
 *    one page trying to carry all of them.
 */

export function generateStaticParams() {
  return COLORING_PAGES.map(p => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const page = getColoringPage(slug)
  if (!page) return {}
  const title = `${page.title} Coloring Page — Free Printable`
  const desc = `A free printable ${page.title} coloring page for kids (${page.scripture}). Bold simple outlines, ${page.ages.toLowerCase()}. Print it straight from the page — no sign-up.`
  const url = `https://faithfulkids.app/printables/bible-coloring-pages/${page.slug}`
  return {
    title,
    description: desc,
    keywords: [
      page.keyword,
      `free ${page.keyword}`,
      `printable ${page.keyword}`,
      `${page.title.toLowerCase()} coloring sheet`,
      'bible coloring pages',
    ],
    alternates: { canonical: url },
    openGraph: {
      title, description: desc, url, siteName: 'Faithful Kids', type: 'article',
      images: [{ url: `${CDN}/${page.slug}.png`, width: 1024, height: 1536 }],
    },
    twitter: {
      card: 'summary_large_image',
      title, description: desc,
      images: [`${CDN}/${page.slug}.png`],
    },
  }
}

export default async function ColoringPageDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const page = getColoringPage(slug)
  if (!page) notFound()

  const others = COLORING_PAGES.filter(p => p.slug !== page.slug).slice(0, 8)
  const url = `https://faithfulkids.app/printables/bible-coloring-pages/${page.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: `${page.title} coloring page`,
    description: page.blurb,
    contentUrl: `${CDN}/${page.slug}.png`,
    thumbnailUrl: `${CDN}/${page.slug}.png`,
    url,
    isFamilyFriendly: true,
    isAccessibleForFree: true,
    license: 'https://faithfulkids.app/terms',
    creditText: 'Faithful Kids',
    creator: { '@type': 'Organization', name: 'Faithful Kids' },
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="no-print"><SiteNav active="printables" /></div>

      <section className="cpd-head no-print">
        <nav className="cpd-crumb">
          <a href="/printables">Printables</a>
          <span>›</span>
          <a href="/printables/bible-coloring-pages">Bible Coloring Pages</a>
        </nav>
        <h1>{page.title} Coloring Page</h1>
        <p className="cpd-meta">{page.scripture} · {page.ages} · Free to print</p>
      </section>

      {/* The sheet itself. Printing this route prints only this image. */}
      <div className="cpd-sheet">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${CDN}/${page.slug}.png`}
          alt={`${page.title} Bible coloring page for kids — free printable, ${page.scripture}`}
          width={1024}
          height={1536}
        />
      </div>

      <div className="cpd-actions no-print">
        <PrintButton />
        <a className="cpd-download" href={`${CDN}/${page.slug}.png`} download>
          Download PNG
        </a>
      </div>

      <section className="cpd-body no-print">
        <p>{page.blurb}</p>
        {page.story && (
          <p>
            Read the story first and the page means more:{' '}
            <a href={`/blog/${page.story}`}>{page.title} explained for kids</a> — a short retelling
            with the video lesson and a quiz.
          </p>
        )}
        <h2>How to print this coloring page</h2>
        <p>
          Press the print button above and it prints the sheet alone, without the menus or this
          text. If you would rather keep it, use Download PNG and print it later, or take the
          whole set as one file from the{' '}
          <a href="/printables/bible-coloring-pages">Bible coloring pages</a> hub.
        </p>
        <h2>More Bible coloring pages</h2>
        <div className="cpd-more">
          {others.map(o => (
            <a key={o.slug} href={`/printables/bible-coloring-pages/${o.slug}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${CDN}/${o.slug}.png`} alt={`${o.title} coloring page`} loading="lazy" />
              <span>{o.title}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>The story behind the page</h2>
          <p>
            Every scene here is an episode in the Faithful Kids library — a few minutes long, with a
            quiz afterwards so you can see what your child actually understood.
          </p>
          <a className="btn-primary" href="/quiz?ref=coloring-detail">
            Start your child&rsquo;s Bible journey
          </a>
        </div>
      </section>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
