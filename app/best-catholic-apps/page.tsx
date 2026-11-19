import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'
import { allListings } from '@/lib/app-directory-db'
import { forAdults, forKids, isCatholic, sortListings, PRICE_LABEL, prettyDate, type Listing, type Category } from '@/lib/christian-apps'
import { AppDirectory } from '../christian-apps/AppDirectory'
import { Card, FkAd } from '../christian-apps/ui'
import { RelatedGuides, KIDS_HUB, ADULTS_HUB } from '../christian-apps/RelatedGuides'
import '../christian-apps/apps.css'

/*
 * Best Catholic Apps, the third directory hub (Nov 19, 2026).
 *
 * DataForSEO Nov 19, 2026: "best catholic apps" 258/mo clickstream at KD 12,
 * "catholic apps" 51/mo; "catholic apps for kids" has no measured volume but
 * its SERP is store pages and Reddit, so the kids section rides along. The
 * "best catholic apps" SERP is Reddit threads and videos with an AI Overview,
 * no directory. Catholic dating apps (255/mo) are left out on purpose, as on
 * /best-christian-apps.
 *
 * Every Catholic listing has category 'catholic', which is useless as a filter
 * here, so this page re-files them by what they are for (CATHOLIC_KIND). Listing
 * pages stay shared at /christian-apps/<slug>; adult Catholic listings point
 * their breadcrumb here (hubFor in lib/christian-apps.ts).
 */

export const revalidate = 3600

const URL = 'https://faithfulkids.app/best-catholic-apps'
const OG = 'https://d3g07v1w0lehiv.cloudfront.net/app-icons/og-best-catholic-apps.png'

const CATHOLIC_KIND: Record<string, Category> = {
  laudate: 'readings', ibreviary: 'readings', 'divine-office': 'readings', universalis: 'readings',
  'catholic-calendar-universalis': 'readings', liturgical: 'readings', magnificat: 'readings',
  'word-among-us': 'readings', 'amen-catholic': 'readings',
  hallow: 'prayer-devotional', 'pray-as-you-go': 'prayer-devotional', intercede: 'prayer-devotional', 'divine-mercy': 'prayer-devotional',
  ascension: 'bible-study', verbum: 'bible-study',
  formed: 'video', ewtn: 'video', 'word-on-fire-digital': 'video',
  'relevant-radio': 'audio', 'catholic-answers': 'audio',
  truthly: 'learning', creedo: 'learning',
}

async function catholicListings() {
  const all = await allListings()
  const adults = sortListings(forAdults(all.filter(isCatholic)))
    .map(l => ({ ...l, category: CATHOLIC_KIND[l.slug] || l.category }))
  const kids = sortListings(forKids(all.filter(isCatholic)))
  return { adults, kids, total: new Set([...adults, ...kids].map(l => l.slug)).size }
}

export async function generateMetadata(): Promise<Metadata> {
  const { total } = await catholicListings()
  const title = `Best Catholic Apps (2026): ${total} Checked and Compared`
  const description = `The best Catholic apps for daily Mass readings, the Liturgy of the Hours, the Rosary, Bible study and kids: ${total} apps, prices and ads checked on each store.`
  return {
    title: { absolute: title },
    description,
    keywords: ['best catholic apps', 'catholic apps', 'catholic apps for kids', 'catholic prayer apps', 'catholic bible apps', 'apps for catholic daily readings', 'free catholic apps', 'liturgy of the hours app'],
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, siteName: 'Faithful Kids', type: 'website', images: [{ url: OG, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [OG] },
  }
}

const faqs = [
  {
    q: 'What is the best Catholic app?',
    a: 'It depends on what you want it for. For daily Mass readings and the Liturgy of the Hours, Laudate, iBreviary and Divine Office are free with no in-app purchases listed. For guided prayer and the Rosary, Hallow is the best known (free to start, with a paid plan). For Bible study, Ascension and Verbum. For Catholic films and programs, Formed, which many parishes provide for free.',
  },
  {
    q: 'What is the best free Catholic app?',
    a: 'Laudate, iBreviary, Divine Office, Amen and Catholic Answers all listed no in-app purchases on the US App Store when we checked, and none carried a "Contains ads" label on Google Play. Laudate covers the most ground: readings, the Hours, the Rosary, prayers and the saint of the day.',
  },
  {
    q: 'What is the best app for Catholic daily readings?',
    a: 'Laudate and Amen are free and include the daily Mass readings. The Word Among Us Mass Edition adds a short meditation each day for a small subscription, and Magnificat is the digital edition of the monthly missal. Universalis and Divine Office pair the readings with the full Liturgy of the Hours.',
  },
  {
    q: 'What are the best Catholic apps for kids?',
    a: 'For the youngest children, Catholic Bible Storybook is free, Saintlings introduces a saint each day, and Calm Catholic Kids is gentle audio for ages 5 and under. Holy Heroes adds saint audio dramas and Sunday Mass prep for ages 3 and up, and Formed has children\'s programs. All are in the kids section above.',
  },
  {
    q: 'Are Catholic AI apps reliable?',
    a: 'Treat them as a starting point. Truthly answers questions from a Catholic point of view, but any AI can get things wrong, so check anything that matters against the Catechism or a priest.',
  },
  {
    q: 'How did you check these apps?',
    a: `Every listing was read from the app's live App Store and Google Play pages and the maker's own site, most recently on ${prettyDate('2026-11-19')}: price, age rating, platforms, the "Contains ads" label and the last update date. Apps not updated in over two years are flagged on their pages.`,
  },
]

export default async function BestCatholicAppsHub() {
  const { adults, kids, total } = await catholicListings()
  const freeCount = adults.filter(l => l.priceModel === 'free').length
  const pick = (f: (l: Listing) => boolean, n = 6) => adults.filter(f).slice(0, n)
  const picks = [
    { h: 'Best free Catholic apps', intro: 'Free to download and use.', items: pick(l => l.priceModel === 'free') },
    { h: 'Best apps for daily Mass readings', intro: 'Readings, missals, the Liturgy of the Hours and the liturgical calendar.', items: pick(l => l.category === 'readings') },
    { h: 'Best Catholic prayer apps', intro: 'Guided prayer, the Rosary, novenas and the Divine Mercy Chaplet.', items: pick(l => l.category === 'prayer-devotional') },
    { h: 'Best Catholic Bible and learning apps', intro: 'Catholic Bibles, study libraries and lessons on the faith.', items: pick(l => l.category === 'bible-study' || l.category === 'learning') },
    { h: 'Catholic TV, radio and films', intro: 'Streaming, live radio and formation programs.', items: pick(l => l.category === 'video' || l.category === 'audio') },
  ].filter(p => p.items.length >= 2)
  const cards = Object.fromEntries(adults.map(l => [l.slug, <Card key={l.slug} l={l} />]))

  const everyone = sortListings([...adults, ...kids.filter(k => !adults.some(a => a.slug === k.slug))])
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Best Catholic Apps',
    url: URL,
    dateModified: '2026-11-19',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: everyone.length,
      itemListElement: everyone.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.name, url: `https://faithfulkids.app/christian-apps/${l.slug}` })),
    },
  }
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: 'Best Christian Apps', item: 'https://faithfulkids.app/best-christian-apps' },
      { '@type': 'ListItem', position: 3, name: 'Best Catholic Apps', item: URL },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <SiteNav />

      <header className="ad-hero">
        <span className="ad-kicker">The Christian Apps Directory</span>
        <h1>The Best Catholic Apps</h1>
        <p className="ad-lede">
          {total} Catholic apps for the daily readings, the Liturgy of the Hours, the Rosary, Bible study and kids,
          each checked on its own store page: the real price, whether it has ads, and when it was last updated.
        </p>
        <div className="ad-stats">
          <span><strong>{total}</strong> apps</span>
          <span><strong>{freeCount}</strong> free</span>
          <span><strong>{kids.length}</strong> for kids</span>
          <span>Checked <strong>{prettyDate('2026-11-19')}</strong></span>
        </div>
        <div className="ad-hero-ctas">
          <a className="ad-btn" href="#directory">Browse the apps</a>
          <a className="ad-btn ad-btn-ghost" href="#kids">Catholic apps for kids</a>
        </div>
      </header>

      <main className="ad-wrap" id="directory">
        <h2 className="ad-grid-h">All {adults.length} Catholic apps for adults, A to Z</h2>
        <AppDirectory listings={adults} cards={cards} showAge={false} ad={<FkAd parents location="best-catholic-apps-hub" />} />

        <section className="ad-section" id="kids">
          <h2>Best Catholic apps for kids</h2>
          <p>
            Saints, Bible stories, Mass prep and bedtime prayer for Catholic children, from toddlers up.
            For every kind of Christian app for children, see the full <a href="/christian-apps">Christian apps for kids directory</a>.
          </p>
          <div className="ad-grid">
            {kids.map(l => <div key={l.slug} className="ad-cell"><Card l={l} /></div>)}
          </div>
        </section>

        <section className="ad-section ad-picks">
          <h2>Best Catholic apps by what you need</h2>
          <div className="ad-picks-grid">
            {picks.map(p => (
              <div key={p.h} className="ad-pick">
                <h3>{p.h}</h3>
                <p>{p.intro}</p>
                <ul>
                  {p.items.map(l => (
                    <li key={l.slug}><a href={`/christian-apps/${l.slug}`}>{l.name}</a> <span>{PRICE_LABEL[l.priceModel]}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16 }}>
            For Bible, prayer and worship apps from every Christian tradition, see <a href="/best-christian-apps">the best Christian apps</a>.
          </p>
        </section>

        <section className="ad-submit-band">
          <div>
            <h2>Make a Catholic app?</h2>
            <p>Submit it for the directory. Every submission is reviewed by our team, and listings are approved at our discretion.</p>
          </div>
          <a className="ad-btn" href="/christian-apps/submit">Submit yours</a>
        </section>

        <RelatedGuides items={[
          ADULTS_HUB,
          KIDS_HUB,
          { slug: 'best-christian-podcasts' },
          { slug: 'lent-for-kids-explained', badge: 'Seasons' },
          { slug: 'who-was-mary-mother-of-jesus-for-kids', badge: 'Bible' },
          { slug: 'where-to-list-a-christian-app', badge: 'For App Makers' },
        ]} />

        <section className="ad-section ad-faq">
          <h2>Questions people ask</h2>
          {faqs.map(f => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
