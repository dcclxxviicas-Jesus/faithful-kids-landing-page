import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'
import { BlogStickyCta } from '../blog/BlogStickyCta'
import { allListings } from '@/lib/app-directory-db'
import { forKids, sortListings, categoryLabel, PRICE_LABEL, CHECKED_ON, GONE, prettyDate, CATEGORIES, type Listing } from '@/lib/christian-apps'
import { AppDirectory } from './AppDirectory'
import { Card, FkAd } from './ui'
import { RelatedGuides, ADULTS_HUB } from './RelatedGuides'
import './apps.css'

/*
 * Christian Apps for Kids: a directory open to submissions.
 *
 * DataForSEO Nov 17, 2026: "christian app directory" has no directory on page
 * 1 (it is church member-directory apps) and faith.tools is absent, so this
 * page targets the parent query "christian apps for kids" (clickstream
 * suppressed as a child term; SERP = Reddit + dated 2024 listicles). Its link
 * value comes from makers pointing at their own detail page.
 *
 * Revalidated hourly, and on approve from /cas-admin/apps, so approved
 * submissions appear without a deploy.
 */

export const revalidate = 3600

const URL = 'https://faithfulkids.app/christian-apps'

export async function generateMetadata(): Promise<Metadata> {
  const n = forKids(await allListings()).length
  const title = `Best Christian Apps for Kids (2026): ${n} Checked and Compared`
  const description = `The best Christian apps for kids, compared: ${n} apps with real prices, ages, ads and last-update dates checked on each store. Submit your own.`
  return {
    title: { absolute: title },
    description,
    keywords: ['best christian apps for kids', 'christian apps for kids', 'christian apps', 'christian app directory', 'bible apps for kids', 'catholic apps for kids', 'free christian apps for kids', 'christian games for kids'],
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, siteName: 'Faithful Kids', type: 'website', images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/app-icons/og-christian-apps.png', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: ['https://d3g07v1w0lehiv.cloudfront.net/app-icons/og-christian-apps.png'] },
  }
}

const faqs = [
  {
    q: 'What are the best Christian apps for kids?',
    a: 'It depends on age and what you want the app to do. For Bible stories, the free Bible App for Kids and Superbook are the most widely used. For shows, Minno and Yippee are the big subscription libraries. For walking through the whole Bible in order with a quiz after each lesson, Faithful Kids (ours). Use the filters above to narrow by age, price and device.',
  },
  {
    q: 'Are there free Christian apps for kids?',
    a: 'Yes, many. Bible App for Kids, Superbook, BibleProject, Keys for Kids, VOM Kids and several Bible trivia apps were free to use when we checked. Set the price filter to "Free to start" to see them all, and check the ads line on each listing, because a few free apps carry ads.',
  },
  {
    q: 'How do you check these apps?',
    a: `Every listing we researched was read from the app's live App Store and Google Play pages and the maker's own site on ${prettyDate(CHECKED_ON)}: price, age rating, platforms, the "Contains ads" label and the last update date. Apps not updated in over two years are flagged. Listings submitted by makers say so.`,
  },
  {
    q: 'How do I get my app or website listed?',
    a: 'Use the submission form. Every submission is reviewed by our team, and listings are approved at our discretion. Approved listings get their own page.',
  },
]

export default async function ChristianAppsHub() {
  const listings = sortListings(forKids(await allListings()))
  const freeCount = listings.filter(l => ['free', 'free-with-ads', 'freemium'].includes(l.priceModel)).length
  const pick = (f: (l: Listing) => boolean, n = 6) => listings.filter(f).slice(0, n)
  const freeish = (l: Listing) => ['free', 'free-with-ads', 'freemium'].includes(l.priceModel)
  const picks = [
    { h: 'Free Christian apps for kids', intro: 'Free to use when we checked; a few carry ads, so read each listing.', items: pick(l => l.priceModel === 'free' && l.ageGroups.some(g => g === 'young' || g === 'older')) },
    { h: 'Christian apps for toddlers and preschoolers', intro: 'Simple, read-aloud and tap-to-play apps for the youngest.', items: pick(l => l.ageGroups.includes('toddler')) },
    { h: 'Christian apps for tweens and teens', intro: 'For kids who have outgrown the cartoon apps.', items: pick(l => l.ageGroups.includes('teen') && l.category !== 'parent-tools') },
    { h: 'Catholic apps for kids', intro: 'Made for Catholic families, from saints stories to Mass prep.', items: pick(l => l.category === 'catholic' || l.denomination === 'Catholic') },
    { h: 'Bible games and trivia apps', intro: 'Quizzes and games that test what kids know.', items: pick(l => l.category === 'games') },
    { h: 'Christian shows and video apps', intro: 'Libraries of Christian shows, films and video lessons.', items: pick(l => l.category === 'video' && !freeish(l) || l.category === 'video' && l.ageGroups.some(g => g === 'young')) },
  ].filter(p => p.items.length >= 3)
  const cards = Object.fromEntries(listings.map(l => [l.slug, <Card key={l.slug} l={l} />]))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Best Christian Apps for Kids',
    url: URL,
    isFamilyFriendly: true,
    dateModified: CHECKED_ON,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listings.length,
      itemListElement: listings.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.name, url: `${URL}/${l.slug}` })),
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
      { '@type': 'ListItem', position: 2, name: 'Best Christian Apps for Kids', item: URL },
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
        <h1>The Best Christian Apps for Kids</h1>
        <p className="ad-lede">
          {listings.length} Christian apps for kids and families, each checked on its own store page:
          the real price, the age rating, whether it has ads, and when it was last updated.
        </p>
        <div className="ad-stats">
          <span><strong>{listings.length}</strong> listings</span>
          <span><strong>{freeCount}</strong> free to start</span>
          <span><strong>{CATEGORIES.filter(c => listings.some(l => l.category === c.key)).length}</strong> categories</span>
          <span>Checked <strong>{prettyDate(CHECKED_ON)}</strong></span>
        </div>
        <div className="ad-hero-ctas">
          <a className="ad-btn" href="#directory">Browse the directory</a>
          <a className="ad-btn ad-btn-ghost" href="/christian-apps/submit">Submit an app or website</a>
        </div>
      </header>

      <main className="ad-wrap" id="directory">
        <h2 className="ad-grid-h">All {listings.length} Christian apps for kids, A to Z</h2>
        <AppDirectory
          listings={listings}
          cards={cards}
          ad={<FkAd location="christian-apps-hub" />}
        />

        <section className="ad-section ad-picks">
          <h2>Quick picks by what you need</h2>
          <div className="ad-picks-grid">
            {picks.map(p => (
              <div key={p.h} className="ad-pick">
                <h3>{p.h}</h3>
                <p>{p.intro}</p>
                <ul>
                  {p.items.map(l => (
                    <li key={l.slug}><a href={`/christian-apps/${l.slug}`}>{l.name}</a> <span>{PRICE_LABEL[l.priceModel]} · ages {l.ages.replace(/^Rated /, 'rated ')}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="ad-section">
          <h2>What changed in 2026</h2>
          <p>Some apps that older lists still recommend are gone, renamed or no longer maintained. Here is what we found when we checked.</p>
          <ul className="ad-gone">
            {GONE.map(g => (
              <li key={g.name}><strong>{g.name}:</strong> {g.status}. <span>{g.evidence}</span></li>
            ))}
          </ul>
        </section>

        <section className="ad-submit-band">
          <div>
            <h2>Make a Christian app or website for kids?</h2>
            <p>Submit it for the directory. Every submission is reviewed by our team, and listings are approved at our discretion. Approved listings get their own page.</p>
          </div>
          <a className="ad-btn" href="/christian-apps/submit">Submit yours</a>
        </section>

        <RelatedGuides title="More Guides for Choosing" items={[
          ADULTS_HUB,
          { slug: 'best-bible-app-for-kids', badge: 'App Reviews' },
          { slug: 'free-bible-apps-for-kids', badge: 'App Reviews' },
          { slug: 'best-bible-apps-by-age', badge: 'App Reviews' },
          { slug: 'christian-alternatives-to-youtube-for-kids', badge: 'Screen Time' },
          { slug: 'best-educational-apps-for-christian-kids', badge: 'App Reviews' },
        ]} />

        <section className="ad-section ad-faq">
          <h2>Questions parents ask</h2>
          {faqs.map(f => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </main>
      <BlogStickyCta postSlug="christian-apps" />
      <SiteFooter />
    </>
  )
}
