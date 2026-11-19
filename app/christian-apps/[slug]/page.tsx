import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteNav, SiteFooter } from '../../components/SiteChrome'
import { BlogStickyCta } from '../../blog/BlogStickyCta'
import { allListings } from '@/lib/app-directory-db'
import {
  CURATED, ALTERNATIVE_TO, FK_SLUG, forKids, forAdults, hubFor, PRICE_LABEL, categoryLabel, prettyDate, isStale, type Listing,
} from '@/lib/christian-apps'
import { AppIcon, PlatformTags, FkAd } from '../ui'
import { BadgeSnippet } from './BadgeSnippet'
import '../apps.css'

export const revalidate = 3600
export const dynamicParams = true

export function generateStaticParams() {
  return CURATED.map(c => ({ slug: c.slug }))
}

async function find(slug: string): Promise<{ app: Listing; all: Listing[] } | null> {
  const all = await allListings()
  const app = all.find(l => l.slug === slug)
  return app ? { app, all } : null
}

function shortDesc(app: Listing): string {
  const base = `${app.name}: price, ages, ads and devices, checked ${prettyDate(app.checkedOn)}. `
  const rest = app.description.replace(/\s+/g, ' ')
  const s = (base + rest).slice(0, 155)
  return s.length < (base + rest).length ? s.replace(/\s+\S*$/, '') + '.' : s
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const hit = await find(slug)
  if (!hit) return { title: 'Not found', robots: { index: false } }
  const { app } = hit
  const title = app.audience === 'adults' ? `${app.name} App Review: Price, Features and Ads (2026)` : `${app.name} Review: Price, Ages and Ads (2026)`
  const url = `https://faithfulkids.app/christian-apps/${app.slug}`
  return {
    title: { absolute: title.length > 62 ? `${app.name} Review for Parents (2026)` : title },
    description: shortDesc(app),
    alternates: { canonical: url },
    openGraph: { title, description: shortDesc(app), url, siteName: 'Faithful Kids', type: 'article', ...(app.icon ? { images: [{ url: app.icon, width: 256, height: 256 }] } : {}) },
  }
}

/* Per-app questions are the searches parents actually type ("is minno free",
 * "what age is superbook for", "apps like yippee"). Built only from checked
 * fields, so every answer is as true as the listing. */
function appFaqs(app: Listing, alts: Listing[]): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = []
  const free = ['free', 'free-with-ads', 'freemium'].includes(app.priceModel)
  out.push({
    q: `Is ${app.name} free?`,
    a: app.priceModel === 'free' ? `Yes. ${app.name} was free to use when we checked on ${prettyDate(app.checkedOn)}.${app.price ? ` ${app.price}.` : ''}`
      : app.priceModel === 'free-with-ads' ? `It is free to use, with ads.${app.price ? ` ${app.price}.` : ''}`
      : app.priceModel === 'freemium' ? `It is free to start, with paid extras. ${app.price || ''}`.trim()
      : `No, ${app.name} is ${app.priceModel === 'subscription' ? 'a subscription' : 'a paid app'}. ${app.price || ''}`.trim(),
  })
  out.push({
    q: `What age is ${app.name} for?`,
    a: app.agesSource === 'maker' ? `The maker says ${app.ages}.` : app.agesSource === 'App Store kids category' ? `Apple lists it in the Kids category for ages ${app.ages}.` : `It is ${app.ages.toLowerCase()} on the app stores; the maker does not state an age range.`,
  })
  if (app.kind === 'app' && app.ads !== 'unknown') out.push({
    q: `Does ${app.name} have ads?`,
    a: app.ads === 'yes' ? 'Yes. Google Play shows a "Contains ads" label on it.' : `We found no "Contains ads" label on its store listing${free ? ', which is worth knowing for a free app' : ''}.`,
  })
  const devs = [app.platforms.ios && 'iPhone and iPad', app.platforms.android && 'Android phones and tablets', app.platforms.web && 'any web browser'].filter(Boolean) as string[]
  if (devs.length) out.push({ q: `What devices does ${app.name} work on?`, a: `${devs.length === 1 ? devs[0] : devs.slice(0, -1).join(', ') + ' and ' + devs[devs.length - 1]}.`.replace(/^[a-hj-z]/, c => c.toUpperCase()) })
  if (alts.length) out.push({
    q: `What are some alternatives to ${app.name}?`,
    a: `Similar Christian apps include ${alts.slice(0, 4).map(a => a.name).join(', ')}${app.slug !== FK_SLUG && app.audience !== 'adults' ? ', and Faithful Kids, which walks kids through the whole Bible in short lessons with a quiz after each' : ''}.`,
  })
  return out
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="ad-fact"><dt>{k}</dt><dd>{children}</dd></div>
}

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hit = await find(slug)
  if (!hit) notFound()
  const { app, all } = hit
  const isFk = app.slug === FK_SLUG
  const rel = app.submitted ? 'ugc noopener' : 'noopener'
  const stale = isStale(app.updated)
  // Closest first: same category, then most shared age groups, then same
  // price model, then name. Alphabetical alone put adult film apps first.
  // Faithful Kids is left out here because its ad already sits above this list.
  const score = (l: Listing) => l.ageGroups.filter(g => app.ageGroups.includes(g)).length * 2 + (l.priceModel === app.priceModel ? 1 : 0)
  const byScore = (a: Listing, b: Listing) => score(b) - score(a) || a.name.localeCompare(b.name)
  // Each listing compares against its own hub: adults-only apps against the
  // adults directory, everything else against the kids directory.
  const adultsOnly = app.audience === 'adults'
  const pool = (adultsOnly ? forAdults(all) : forKids(all)).filter(l => l.slug !== app.slug && l.slug !== FK_SLUG)
  const related = pool.filter(l => l.category === app.category).sort(byScore).slice(0, 6)
  const more = related.length < 4
    ? pool.filter(l => l.category !== app.category && (adultsOnly || l.ageGroups.some(g => app.ageGroups.includes(g)))).sort(byScore).slice(0, 6 - related.length)
    : []
  const hub = hubFor(app)
  const url = `https://faithfulkids.app/christian-apps/${app.slug}`
  const alts = [...related, ...more].filter(r => r.slug !== FK_SLUG)
  const faqs = appFaqs(app, alts)
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': app.kind === 'website' ? 'WebSite' : 'SoftwareApplication',
    name: app.name,
    url: app.website || app.platforms.ios || app.platforms.android || url,
    ...(app.kind === 'app' ? { applicationCategory: 'EducationalApplication', operatingSystem: [app.platforms.ios && 'iOS', app.platforms.android && 'Android', app.platforms.web && 'Web'].filter(Boolean).join(', ') } : {}),
    ...(app.maker ? { author: { '@type': 'Organization', name: app.maker } } : {}),
    ...(app.icon ? { image: app.icon } : {}),
    description: app.description,
  }
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://faithfulkids.app' },
      { '@type': 'ListItem', position: 2, name: hub.label, item: `https://faithfulkids.app${hub.href}` },
      { '@type': 'ListItem', position: 3, name: app.name, item: url },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteNav />
      <main className="ad-wrap ad-detail">
        <nav className="ad-crumbs" aria-label="Breadcrumb">
          <a href={hub.href}>{hub.label}</a> <span aria-hidden="true">/</span> {categoryLabel(app.category)}
        </nav>

        <header className="ad-dh">
          <AppIcon app={app} size={96} />
          <div>
            <h1>{app.name} <span className="ad-h1-tail">{adultsOnly ? 'app review' : 'review for parents'}</span></h1>
            <p className="ad-dh-sub">
              {app.maker && <>by {app.maker} · </>}{categoryLabel(app.category)}
              {app.denomination && app.denomination !== 'non-denominational' && app.denomination !== categoryLabel(app.category) && <> · {app.denomination}</>}
            </p>
            <div className="ad-card-meta">
              <span className={`ad-price ad-price-${app.priceModel}`}>{PRICE_LABEL[app.priceModel]}</span>
              <span className="ad-chip">Ages {app.ages.replace(/^Rated /, 'rated ')}</span>
              {app.ads === 'yes' && <span className="ad-chip ad-chip-warn">Contains ads</span>}
              {app.ads === 'no' && <span className="ad-chip ad-chip-ok">No ads label</span>}
              {stale && <span className="ad-chip ad-chip-warn">Not updated in 2+ years</span>}
            </div>
            <div className="ad-stores">
              {app.platforms.ios && <a className="ad-store" href={app.platforms.ios} rel={rel} target="_blank">App Store</a>}
              {app.platforms.android && <a className="ad-store" href={app.platforms.android} rel={rel} target="_blank">Google Play</a>}
              {app.platforms.web && <a className="ad-store" href={app.platforms.web} rel={rel} target="_blank">Website</a>}
            </div>
          </div>
        </header>

        {app.submitted && (
          <p className="ad-note">This listing was submitted by its maker and approved by our team. The description is theirs.</p>
        )}

        <div className="ad-dgrid">
          <section className="ad-dmain">
            <h2>What it is</h2>
            <p>{app.description}</p>
            {app.goodFor && <>
              <h2>Good for</h2>
              <p>{app.goodFor}</p>
            </>}
            {app.worthKnowing && <>
              <h2>Worth knowing</h2>
              <p>{app.worthKnowing}</p>
            </>}
          </section>

          <aside className="ad-facts">
            <h2>The facts</h2>
            <dl>
              {app.price && <Row k="Price">{app.price}</Row>}
              <Row k="Ages">{app.ages} <span className="ad-src">({app.agesSource})</span></Row>
              <Row k="Devices"><PlatformTags p={app.platforms} /></Row>
              {app.kind === 'app' && <Row k="Ads">{app.ads === 'yes' ? 'Yes, store shows "Contains ads"' : app.ads === 'no' ? 'No "Contains ads" label' : 'Not stated by the store'}</Row>}
              {app.updated && <Row k="Last updated">{prettyDate(app.updated)}</Row>}
              <Row k={app.submitted ? 'Listed' : 'Checked'}>{prettyDate(app.checkedOn)}</Row>
            </dl>
            {app.sources.length > 0 && (
              <p className="ad-src">Sources: {app.sources.slice(0, 3).map((s, i) => (
                <span key={s}>{i > 0 && ', '}<a href={s} rel="nofollow noopener" target="_blank">{new globalThis.URL(s).hostname.replace(/^www\./, '')}</a></span>
              ))}</p>
            )}
          </aside>
        </div>

        {!isFk && <FkAd parents={adultsOnly} alternativeTo={!adultsOnly && (ALTERNATIVE_TO.has(app.slug) || app.submitted) ? app.name : undefined} location={`christian-apps-${app.slug}`} />}

        {[...related, ...more].length > 0 && (
          <section className="ad-section">
            <h2>Alternatives to {app.name}</h2>
            <div className="ad-mini">
              {[...related, ...more].map(r => (
                <a key={r.slug} href={`/christian-apps/${r.slug}`} className="ad-mini-card">
                  <AppIcon app={r} size={44} />
                  <span><strong>{r.name}</strong><small>{PRICE_LABEL[r.priceModel]} · Ages {r.ages.replace(/^Rated /, 'rated ')}</small></span>
                </a>
              ))}
            </div>
            <p><a href={hub.href}>See all the {hub.label.replace(/^Best/, 'best')}</a></p>
          </section>
        )}

        <section className="ad-section ad-faq">
          <h2>{app.name}: questions {adultsOnly ? 'people' : 'parents'} ask</h2>
          {faqs.map(f => (
            <details key={f.q} open>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="ad-section ad-badge-sec">
          <h2>Is this your {app.kind === 'website' ? 'website' : 'app'}?</h2>
          <p>You can show this listing on your site with our badge. Copy the snippet below. Something out of date? Email <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a> and we will fix it.</p>
          <BadgeSnippet slug={app.slug} name={app.name} />
        </section>
      </main>
      <BlogStickyCta postSlug={`christian-apps-${app.slug}`} />
      <SiteFooter />
    </>
  )
}
