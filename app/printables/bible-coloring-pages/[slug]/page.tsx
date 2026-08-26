import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '../../../components/SiteChrome'
import PrintButton from '../../PrintButton'
import { COLORING_PAGES, getColoringPage, CDN } from '@/lib/coloring-pages'
import { EmailCaptureCard } from '../../../blog/EmailCaptureCard'

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
        <h2>What to talk about while they color</h2>
        <p>{page.talkAbout}</p>
        <p>{page.tip}</p>

        <h2>Who this page suits</h2>
        <p>
          Drawn for {page.ages.toLowerCase()}, though the age band is a guide rather than a rule.
          A confident younger child will happily take a page marked older, especially if an adult
          is coloring alongside them and reading the story aloud. The outlines are deliberately
          thick and the shapes deliberately large, because the most common reason a child abandons
          a coloring page is that the spaces are too small for the crayon in their hand.
        </p>

        <h2>How to print this coloring page</h2>
        <p>
          Press the print button above and it prints the sheet alone, without the menus or this
          text. If you would rather keep it, use Download PNG and print it later, or take the
          whole set as one file from the{' '}
          <a href="/printables/bible-coloring-pages">Bible coloring pages</a> hub.
        </p>
        <h2>Common questions</h2>
        <p>
          <strong>Can I use this in Sunday school or a classroom?</strong> Yes. Print as many
          copies as you need for a class, a church group, a homeschool co-op or a camp. There is no
          licence to buy and no attribution required, though the page carries our name in the
          bottom margin so anyone who asks where it came from can find it.
        </p>
        <p>
          <strong>Do I have to give an email address?</strong> No. Every page on this site prints
          without a sign-up. The only thing behind an email is the combined PDF of all 26 pages,
          which exists because printing one file is easier than printing twenty-six.
        </p>
        <p>
          <strong>What paper size does it print on?</strong> It is sized for US Letter and prints
          cleanly on A4 as well, with slightly wider margins. If your printer crops the edges, set
          scaling to &ldquo;fit to page&rdquo; rather than 100 percent.
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

      <section className="cp-capture no-print">
        <EmailCaptureCard
          magnet="coloring-pages"
          source="blog-inline"
          sourcePost={`coloring-${page.slug}`}
          title="\u{1F58D}\uFE0F Want all 26 pages in one PDF?"
          subtitle="Print the whole set at once instead of one page at a time \u2014 Creation to the Empty Tomb."
        />
      </section>

      <section className="blog-bottom-cta no-print">
        <div className="blog-bottom-cta-inner">
          <h2>Now watch {page.title}</h2>
          <p>
            Your child colors it in ten minutes. The video tells them what actually happened in
            about two — then a quiz shows you what they took in, which a coloring page never can.
            {page.title} is one of 200 episodes, all in order, Genesis to Revelation.
          </p>
          <a className="btn-primary" href="/quiz?ref=coloring-detail">
            Watch {page.title} free
          </a>
          <div className="blog-cta-badges">
            <span>200 stories</span><span>Quiz after every one</span><span>No ads, ever</span>
          </div>
        </div>
      </section>

      <div className="no-print"><SiteFooter /></div>
    </>
  )
}
