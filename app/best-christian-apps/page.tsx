import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'
import { allListings } from '@/lib/app-directory-db'
import { forAdults, sortListings, PRICE_LABEL, CHECKED_ON, GONE_ADULTS, prettyDate, CATEGORIES, type Listing } from '@/lib/christian-apps'
import { AppDirectory } from '../christian-apps/AppDirectory'
import { Card, FkAd } from '../christian-apps/ui'
import { RelatedGuides, KIDS_HUB, CATHOLIC_HUB } from '../christian-apps/RelatedGuides'
import '../christian-apps/apps.css'

/*
 * Best Christian Apps (adults and families), the sibling of /christian-apps.
 *
 * DataForSEO Nov 17, 2026: "best christian apps" 51/mo clickstream at KD 0,
 * "christian apps" 103/mo at KD 57, plus "best christian prayer apps" and
 * "best christian meditation apps" (51/mo each). The SERP is Reddit and dated
 * listicles. Christian dating apps (the biggest term in the cluster) are left
 * out on purpose: off-topic for a kids' faith site.
 *
 * Listing pages are shared with the kids directory at /christian-apps/<slug>;
 * `audience` decides which hub lists each app (lib/christian-apps.ts).
 */

export const revalidate = 3600

const URL = 'https://faithfulkids.app/best-christian-apps'
const OG = 'https://d3g07v1w0lehiv.cloudfront.net/app-icons/og-best-christian-apps.png'

export async function generateMetadata(): Promise<Metadata> {
  const n = forAdults(await allListings()).length
  const title = `Best Christian Apps (2026): ${n} Checked and Compared`
  const description = `The best Christian apps for Bible reading, study, prayer, devotionals, worship and Catholic life: ${n} apps with real prices and ads checked on each store.`
  return {
    title: { absolute: title },
    description,
    keywords: ['best christian apps', 'christian apps', 'best bible apps', 'best christian prayer apps', 'best christian meditation apps', 'free christian apps', 'best catholic apps', 'christian devotional apps'],
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, siteName: 'Faithful Kids', type: 'website', images: [{ url: OG, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [OG] },
  }
}

const faqs = [
  {
    q: 'What are the best Christian apps?',
    a: 'It depends on what you want the app for. For reading the Bible, the YouVersion Bible App is free with no in-app purchases listed. For deeper study, Blue Letter Bible is free and Logos has free and paid tiers. For prayer, Hallow, Abide and the free Pray As You Go and Lectio 365. For listening, Dwell is an audio Bible subscription. Use the filters above to narrow by type, price and device.',
  },
  {
    q: 'What is the best free Bible app?',
    a: 'The YouVersion Bible App, Bible.is and Blue Letter Bible all listed no in-app purchases on the US App Store when we checked in November 2026, and none carried a "Contains ads" label on Google Play.',
  },
  {
    q: 'What are the best Christian prayer apps?',
    a: 'Hallow and Abide are the best-known guided prayer apps (both free to start, with paid plans). Pray As You Go and Lectio 365 are free. PrayerMate is free for keeping your own prayer lists, with an optional patron tier.',
  },
  {
    q: 'What are the best Catholic apps?',
    a: 'Hallow for guided prayer, Laudate, iBreviary and Divine Office (all free) for daily readings and the Liturgy of the Hours, and Formed for Catholic films and programs by subscription. They are all in the Catholic filter above.',
  },
  {
    q: 'How did you check these apps?',
    a: `Every listing was read from the app's live App Store and Google Play pages and the maker's own site on ${prettyDate(CHECKED_ON)}: price, age rating, platforms, the "Contains ads" label and the last update date. Apps not updated in over two years are flagged on their pages.`,
  },
]

export default async function BestChristianAppsHub() {
  const listings = sortListings(forAdults(await allListings()))
  const freeCount = listings.filter(l => ['free', 'free-with-ads', 'freemium'].includes(l.priceModel)).length
  const pick = (f: (l: Listing) => boolean, n = 6) => listings.filter(f).slice(0, n)
  const picks = [
    { h: 'Best free Bible apps', intro: 'Free to read, with no in-app purchases listed when we checked.', items: pick(l => l.category === 'bible' && l.priceModel === 'free') },
    { h: 'Best Bible study apps', intro: 'Commentaries, study notes and original-language tools.', items: pick(l => l.category === 'bible-study') },
    { h: 'Best Christian prayer apps', intro: 'Guided prayer, daily devotions and prayer lists.', items: pick(l => l.category === 'prayer-devotional') },
    { h: 'Best Catholic apps', intro: 'Daily readings, the Liturgy of the Hours, prayer and Catholic media.', items: pick(l => l.category === 'catholic') },
    { h: 'Audio Bibles, sermons and teaching', intro: 'For the commute, the gym and the dishes.', items: pick(l => l.category === 'audio' || l.category === 'music') },
    { h: 'Christian accountability apps', intro: 'Filtering and accountability for adults and families.', items: pick(l => l.category === 'accountability' || l.category === 'parent-tools') },
  ].filter(p => p.items.length >= 3)
  const cards = Object.fromEntries(listings.map(l => [l.slug, <Card key={l.slug} l={l} />]))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Best Christian Apps',
    url: URL,
    dateModified: CHECKED_ON,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listings.length,
      itemListElement: listings.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.name, url: `https://faithfulkids.app/christian-apps/${l.slug}` })),
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
      { '@type': 'ListItem', position: 2, name: 'Best Christian Apps', item: URL },
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
        <h1>The Best Christian Apps</h1>
        <p className="ad-lede">
          {listings.length} Christian apps for Bible reading, study, prayer, worship and Catholic life,
          each checked on its own store page: the real price, whether it has ads, and when it was last updated.
        </p>
        <div className="ad-stats">
          <span><strong>{listings.length}</strong> apps</span>
          <span><strong>{freeCount}</strong> free to start</span>
          <span><strong>{CATEGORIES.filter(c => listings.some(l => l.category === c.key)).length}</strong> categories</span>
          <span>Checked <strong>{prettyDate(CHECKED_ON)}</strong></span>
        </div>
        <div className="ad-hero-ctas">
          <a className="ad-btn" href="#directory">Browse the apps</a>
          <a className="ad-btn ad-btn-ghost" href="/christian-apps">Apps for kids</a>
        </div>
      </header>

      <main className="ad-wrap" id="directory">
        <h2 className="ad-grid-h">All {listings.length} Christian apps, A to Z</h2>
        <AppDirectory listings={listings} cards={cards} showAge={false} ad={<FkAd parents location="best-christian-apps-hub" />} />

        <section className="ad-section ad-picks">
          <h2>Best Christian apps by what you need</h2>
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
            Catholic? Our <a href="/best-catholic-apps">guide to the best Catholic apps</a> compares every Catholic app we checked,
            from daily readings and the Liturgy of the Hours to novenas, with a section of Catholic apps for kids.
          </p>
        </section>

        {GONE_ADULTS.length > 0 && (
          <section className="ad-section">
            <h2>Apps that stopped updating</h2>
            <p>Still in the stores, but no longer maintained when we checked.</p>
            <ul className="ad-gone">
              {GONE_ADULTS.map(g => (
                <li key={g.name}><strong>{g.name}:</strong> <span>{g.evidence}</span></li>
              ))}
            </ul>
          </section>
        )}

        <section className="ad-submit-band">
          <div>
            <h2>Make a Christian app?</h2>
            <p>Submit it for the directory. Every submission is reviewed by our team, and listings are approved at our discretion.</p>
          </div>
          <a className="ad-btn" href="/christian-apps/submit">Submit yours</a>
        </section>

        <RelatedGuides items={[
          KIDS_HUB,
          CATHOLIC_HUB,
          { slug: 'best-christian-podcasts' },
          { slug: 'best-bible-translation-for-kids', badge: 'Bible' },
          { slug: 'where-to-list-a-christian-app', badge: 'For App Makers' },
          { slug: 'christian-influencers' },
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
