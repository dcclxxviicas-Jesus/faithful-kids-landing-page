import { VideoTile } from '../components/VideoTile'
import { STORIES } from '../components/stories'
import { PRICE_LABEL, categoryLabel, type Listing } from '@/lib/christian-apps-meta'

/*
 * Shared pieces for /christian-apps. Ground truth for every Faithful Kids
 * claim below: 300+ lessons, about two minutes each, 31 series, ages 5-15
 * (check-counts.py). The CTA carries no trial length or price on purpose, so
 * it never goes stale when either changes.
 */

export function AppIcon({ app, size = 56 }: { app: Pick<Listing, 'name' | 'icon'>; size?: number }) {
  if (app.icon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="ad-icon" src={app.icon} alt={`${app.name} icon`} width={size} height={size} loading="lazy" />
  }
  return (
    <span className="ad-icon ad-icon-letter" style={{ width: size, height: size }} aria-hidden="true">
      {app.name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

export function PlatformTags({ p }: { p: Listing['platforms'] }) {
  return (
    <span className="ad-plats">
      {p.ios && <span>iPhone/iPad</span>}
      {p.android && <span>Android</span>}
      {p.web && <span>Web</span>}
    </span>
  )
}

// Creation, by owner's pick (Nov 17, 2026). Resolved by title, never index.
const CLIP = STORIES.find(s => s.title.startsWith('In the Beginning')) || STORIES[0]

export function FkAd({ alternativeTo, location, parents = false }: { alternativeTo?: string; location: string; parents?: boolean }) {
  return (
    <aside className="ad-fk" aria-label="From Faithful Kids">
      <div className="ad-fk-media">
        <VideoTile
          src={CLIP.src}
          poster={CLIP.poster}
          title={CLIP.title}
          badge="Faithful Kids lesson"
          location={location}
          showLabels={false}
          ctaHref={`/quiz?ref=${location}`}
        />
      </div>
      <div className="ad-fk-copy">
        <span className="ad-fk-label">From us, the makers of this directory</span>
        <h2>{alternativeTo ? `Looking for an alternative to ${alternativeTo}?` : parents ? 'Got kids? Give them a Bible app they ask for' : 'A Bible app kids actually ask for'}</h2>
        <p>
          {alternativeTo
            ? `Faithful Kids takes a different approach from ${alternativeTo}: instead of a library to browse, it walks kids through the whole Bible in order, one short lesson at a time.`
            : parents
            ? 'Faithful Kids is the Bible app we make for children 5 to 15: it walks them through the whole Bible in order, one short animated lesson at a time, while you use the apps on this page yourself.'
            : 'Faithful Kids walks kids through the whole Bible in order, one short lesson at a time, so the screen time already happening points somewhere good.'}
        </p>
        <ul>
          <li><strong>300+ video lessons</strong>, about two minutes each, Genesis to Revelation</li>
          <li><strong>A quiz after every lesson</strong>, plus streaks and levels kids care about</li>
          <li><strong>Ages 5 to 15</strong>, no ads, no autoplay, a parent dashboard</li>
        </ul>
        <div className="ad-fk-ctas">
          <a className="ad-btn" href={`/quiz?ref=${location}`}>Start your free trial</a>
          <a className="ad-link" href="/christian-apps/faithful-kids">See our listing</a>
        </div>
        <p className="ad-fk-note">Web, iPhone, iPad and Android. We list ourselves in this directory like everyone else, in alphabetical order.</p>
      </div>
    </aside>
  )
}

export function Card({ l }: { l: Listing }) {
  return (
    <a className="ad-card" href={`/christian-apps/${l.slug}`}>
      <div className="ad-card-top">
        <AppIcon app={l} />
        <div className="ad-card-id">
          <h3>{l.name}</h3>
          {l.maker && <span className="ad-maker">{l.maker}</span>}
        </div>
      </div>
      <p className="ad-card-desc">{l.goodFor || l.description}</p>
      <div className="ad-card-meta">
        <span className={`ad-price ad-price-${l.priceModel}`}>{PRICE_LABEL[l.priceModel]}</span>
        <span className="ad-chip">{categoryLabel(l.category)}</span>
        <span className="ad-chip">Ages {l.ages.replace(/^Rated /, 'rated ')}</span>
      </div>
      <PlatformTags p={l.platforms} />
    </a>
  )
}
