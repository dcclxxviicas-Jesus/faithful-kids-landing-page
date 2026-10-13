import { Baloo_2 } from 'next/font/google'
import { SiteFooter, SiteNav } from '@/app/components/SiteChrome'
import { STORIES } from '@/app/components/stories'
import { VideoTile } from '@/app/components/VideoTile'
import { TrackedLink } from '@/app/components/TrackedLink'
import { HomeExitIntent } from '@/app/components/HomeExitIntent'
import storyDurations from '@/lib/story-durations.json'
import './home.css'

/**
 * The homepage. Redesigned Oct 12 2026 — the owner's father asked for
 * something warmer and more inviting, and this is the result of that pass:
 * full-bleed storybook hero, Baloo 2 display face, the real lessons sitting in
 * a card that overlaps the art, pastel step circles, tinted testimonials.
 *
 * It is a SERVER component. The old homepage was `'use client'` end to end for
 * the sake of three onClick handlers and an accordion; the only client code
 * left is the exit takeover, the video tiles and the CTA links, each its own
 * small island. Everything a crawler needs is in the server HTML.
 *
 * Nothing here is newly claimed. Prices come from app/api/checkout/route.ts
 * (1299 / 9700) and the 7-day trial is annual-only, exactly as Stripe is
 * configured; counts are check-counts.py ground truth; the testimonials and the
 * FAQ are the ones the previous homepage carried, verbatim.
 *
 * Page metadata (title, description, canonical, OG, robots) comes from the
 * ROOT layout — app/layout.tsx is the homepage's metadata, so there is no
 * metadata export here and there must not be one, or it will override it.
 */

/* The rounded display face the design was drawn in. Declared here rather than
   in the root layout so it loads on this page only — it is not used anywhere
   else on the site. */
const display = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const SITE = 'https://faithfulkids.app'

/* The hero painting, at three widths. It is the LCP element on every visit, so
   a phone must not be made to download the 1536px original (300KB). */
const HERO_SRC = `${CDN}/home/hero-meadow-1536.webp`
const HERO_SRCSET = [768, 1152, 1536]
  .map(w => `${CDN}/home/hero-meadow-${w}.webp ${w}w`)
  .join(', ')

/* Resolve by title, never by index — indices shifted once before and silently
   repointed a whole section. `slug` is the story's blog post, which is where
   its measured runtime lives (ffprobe on all 200, lib/story-durations.json). */
const SHELF_SPEC = [
  { title: 'In the Beginning: Creation', slug: 'in-the-beginning-creation-for-kids', scripture: 'Genesis 1-2' },
  { title: 'A Baby in a Basket', slug: 'a-baby-in-a-basket-for-kids', scripture: 'Exodus 1-2' },
  { title: 'Noah & the Great Flood', slug: 'noah-and-the-great-flood-for-kids', scripture: 'Genesis 6-9' },
]
const SHELF = SHELF_SPEC.map(spec => {
  const story = STORIES.find(s => s.title === spec.title)
  if (!story) throw new Error(`Homepage shelf: no story titled "${spec.title}" in stories.ts`)
  return { ...spec, ...story }
})

/* Prices are the real ones from app/api/checkout/route.ts (1299 / 9700) and
   the 7-day trial is annual-only, exactly as Stripe is configured. Derived,
   never hardcoded — the saving and the per-month figure follow the prices. */
const MONTHLY = 12.99
const ANNUAL = 97
const PER_MONTH = (ANNUAL / 12).toFixed(2)
const SAVE_PCT = Math.round((1 - ANNUAL / (MONTHLY * 12)) * 100)

const FAQS = [
  { q: 'What age is this for?', a: 'Our Bible story videos are designed for kids ages 5 and up. Younger kids (5-7) get shorter, simpler retellings with bright visuals. Older kids (8+) get deeper stories with more context and life lessons.' },
  { q: 'Is it really ad-free?', a: 'Yes. Zero ads, ever. No pre-rolls, no banners, no sponsored content. We make money from subscriptions, not from advertising to your children.' },
  { q: 'How is this different from YouTube Kids?', a: 'YouTube Kids uses an algorithm that serves whatever keeps kids watching. Every story is retold from the Bible text itself, with the scripture reference shown. No rabbit holes, no surprises, no junk content.' },
  { q: 'What makes this different from other Bible apps for kids?', a: 'Most Bible apps for kids are built for the youngest readers, so children tend to outgrow them somewhere around age 7 or 8 and quietly stop opening them. Faithful Kids is made for the years after that. It works through the whole story of Scripture in order rather than a handful of favorite stories, and every lesson ends with a quiz, so you can see what your child actually understood instead of guessing.' },
  { q: 'Is Faithful Kids a Christian app for kids of any denomination?', a: 'Yes. It is a Christian app for kids built around the stories all Christian traditions share, told faithfully to Scripture. The stories are the ones Catholic, Evangelical, and Non-denominational families all teach.' },
  { q: 'Can I set screen time limits?', a: 'Yes. Set daily limits per child. When time is up, the app gently pauses. No more "just one more video" battles.' },
  { q: 'Which denomination is the content for?', a: 'Our core Bible stories (David & Goliath, Noah, the Good Samaritan, the Nativity) are told faithfully to Scripture and resonate across Christian traditions. Catholic, Evangelical, and Non-denominational families all use it.' },
  { q: 'Is the content doctrinally accurate?', a: 'Every story is retold from the Bible text itself, with the scripture reference on screen so you can check it against the original. We simplify the language for children without changing the meaning, and we stay on the narrative all Christian traditions share. If you find something that is not right, email christian@faithfulkids.app and we fix it.' },
  { q: 'What devices does it work on?', a: 'Any device with a web browser: iPhone, iPad, Android phones and tablets, laptops, and desktops. There is nothing to install: kids sign in at app.faithfulkids.app and watch.' },
  { q: 'What is the refund policy?', a: 'Full 30-day money-back guarantee. If your kids do not love it, we will refund you completely. No questions asked.' },
  { q: 'How often is new content added?', a: 'The library already covers the whole Bible in order: 300+ video lessons across 30+ series, Genesis to Revelation. New series and deep dives are added regularly on top of that.' },
  { q: 'How are the videos made?', a: 'We use advanced AI video technology to create beautiful, consistent storytelling at a pace no traditional studio could match. Every script is written from the Bible text with its scripture reference, and reviewed by a real person before it goes live. The technology lets us produce high-quality content fast, which means your kids get new stories every week instead of waiting months between releases.' },
  { q: 'Are there quizzes?', a: 'Yes. Every lesson comes with a short quiz so your child can check what they learned. It is not a test. It is a fun way to make sure the story sticks. Parents can see quiz results in the dashboard.' },
]

/* ISO 8601 for schema. Durations are ffprobe-measured, not estimated — the old
   copy claimed "60-second" lessons and was wrong by a factor of two. */
function iso8601(secs: number) {
  return `PT${Math.floor(secs / 60)}M${secs % 60}S`
}

export default function Home() {
  /* The three lessons playable on this page, declared so Google can see what
     the videos are. No mainEntityOfPage: each story's own blog post is the
     page that should rank for the video, and two pages claiming to be the
     main page of one video is a conflict signal. uploadDate matches the date
     those posts publish under, so one video never carries two dates across
     our own pages. */
  const videoLd = SHELF.map(s => {
    const secs = (storyDurations as Record<string, number>)[s.slug]
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${s.title}: Bible Story for Kids`,
      // The blurbs are shared with the blog and the quiz, so they are not
      // edited at source; this page just does not print em dashes.
      description: s.blurb.replace(/\s*—\s*/g, ': '),
      thumbnailUrl: s.poster,
      contentUrl: s.src,
      uploadDate: '2026-04-01',
      ...(secs ? { duration: iso8601(secs) } : {}),
      isFamilyFriendly: true,
      inLanguage: 'en',
      publisher: { '@type': 'Organization', '@id': `${SITE}/#organization` },
    }
  })

  return (
    <div className={`${display.variable} hv2`}>

      {/* React hoists this into <head>. Without it the browser does not even
          know the hero exists until it has parsed the stylesheet, and the LCP
          image starts ~380ms late. imageSizes/imageSrcSet must match the <img>
          exactly or the preload is wasted and the browser warns about it. */}
      <link
        rel="preload"
        as="image"
        href={HERO_SRC}
        imageSrcSet={HERO_SRCSET}
        imageSizes="100vw"
        fetchPriority="high"
      />

      {/* App schema. Tells Google this domain is a product, not just a blog —
          the homepage carried only Organization + WebSite markup until Aug
          2026, so nothing on the site identified Faithful Kids as an app.
          NOTE: deliberately no aggregateRating. Any star figure we could put
          here is marketing copy, not ratings collected from real users, and
          Google issues manual actions for review markup that isn't genuine.
          Add aggregateRating only once real reviews exist and are shown
          on-page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Faithful Kids',
          alternateName: 'Faithful Kids Bible App for Kids',
          applicationCategory: 'EducationalApplication',
          applicationSubCategory: 'Bible study app for children',
          operatingSystem: 'iOS, Web',
          url: SITE,
          // installUrl deliberately omitted: /quiz is a funnel, not an install, and
          // pointing at the App Store is a channel decision (iOS is the lower-margin
          // tier). The App Store is already linked via Organization.sameAs.
          description:
            'A Bible app for kids ages 5-15. 300+ short Bible story videos from Genesis to Revelation, each followed by a quiz and a reflection, with a parent dashboard and multiple kid profiles. No ads.',
          inLanguage: 'en',
          isFamilyFriendly: true,
          audience: {
            '@type': 'PeopleAudience',
            audienceType: 'Children and parents',
            suggestedMinAge: 5,
            suggestedMaxAge: 15,
          },
          featureList: [
            '300+ Bible story videos',
            'Quiz after every episode',
            'Reflection prompts',
            'Multiple kid profiles',
            'Parent dashboard with progress tracking',
            'Offline-free, ad-free viewing',
          ],
          offers: [
            {
              '@type': 'Offer',
              name: 'Monthly',
              price: MONTHLY.toFixed(2),
              priceCurrency: 'USD',
              category: 'subscription',
              url: `${SITE}/checkout`,
            },
            {
              '@type': 'Offer',
              name: 'Annual',
              price: ANNUAL.toFixed(2),
              priceCurrency: 'USD',
              category: 'subscription',
              url: `${SITE}/checkout`,
            },
          ],
          publisher: { '@type': 'Organization', '@id': `${SITE}/#organization` },
        }) }}
      />

      {/* FAQ schema, generated from the FAQS array so it can never drift out of
          sync with what the page actually shows.
          Reality check: Google restricted FAQ rich results to government and
          health sites in 2023, so this will NOT produce a rich snippet. It is
          here because it gives AI Overviews and LLM crawlers clean, attributable
          question/answer pairs — which is where this traffic is going. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }) }}
      />

      {/* One node per lesson actually playable on this page. Video rich results
          DO still display, unlike FAQ ones. URLs HEAD-verified 200. */}
      {videoLd.map(ld => (
        <script
          key={ld.contentUrl}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <SiteNav />

      <main id="main-content">

      <section className="hv-hero" aria-label="Hero">
        {/* Decorative by design: the art is a meadow, and describing a meadow
            tells a screen reader nothing it needs. It is an <img> rather than a
            CSS background because it is the LCP element, and the preload above
            plus fetchPriority gets it on screen sooner.

            Three widths, not one. The single 1536px original was 300KB and
            pushed mobile LCP to 5.1s on simulated 4G; a phone now takes the
            768px copy at 44KB. */}
        <img
          className="hv-hero-art"
          src={HERO_SRC}
          srcSet={HERO_SRCSET}
          sizes="100vw"
          alt=""
          width={1536}
          height={1024}
          fetchPriority="high"
        />
        <div className="hv-hero-inner">
          <p className="hv-eyebrow">Bible stories for kids ages 5&ndash;15</p>
          <h1 className="hv-h1">
            Where kids{' '}
            <span className="hv-nb">
              fall in{' '}
              <span className="hv-love">
                <span className="l l1">l</span><span className="l l2">o</span>
                <span className="l l3">v</span><span className="l l4">e</span>
              </span>
            </span>{' '}
            with the Bible
          </h1>
          <p className="hv-sub">
            300+ short story videos, Genesis to Revelation. About two minutes each,
            with a quiz and a reflection after every one. No ads, no algorithm, no comments.
          </p>
          <TrackedLink
            className="hv-cta"
            href="/quiz"
            event="cta_click"
            props={{ location: 'hero' }}
          >
            <span className="hv-cta-play" aria-hidden="true" />
            Start watching free
          </TrackedLink>
        </div>
      </section>

      <div className="hv-shelf-wrap">
        <div className="hv-shelf">
          <h2>Watch one right now</h2>
          {/* "Watch one right now" invites the suspicion that these are
              trailers, so the subhead answers that directly — and it is true:
              the tiles open s.src, the full lesson-video.mp4, not loopSrc. */}
          <p className="hv-shelf-sub">
            See exactly what your kids will watch. Full lessons, not clips.
          </p>
          <div className="hv-tiles">
            {SHELF.map(s => (
              <VideoTile
                key={s.title}
                src={s.src}
                poster={s.poster}
                /* 640x360 copies. The three full-size posters were 163KB for
                   tiles that render ~320px wide; these are 63KB. The modal
                   still gets the full one. */
                tilePoster={s.poster.replace('/video-posters/', '/video-posters/sm/')}
                title={s.title}
                badge={s.badge}
                location="home-shelf"
                showLabels
                previewSrc={s.src.replace(/lesson-video\.mp4$/, 'lesson-preview.mp4')}
              />
            ))}
          </div>
          <p className="hv-note">31 series &middot; 300+ lessons &middot; new ones every week</p>
        </div>
      </div>

      <section className="hv-how">
        <div className="hv-how-head">
          <p className="hv-eyebrow">What a lesson looks like</p>
          <h2>Watch. Quiz. Reflect.</h2>
          <svg className="hv-swash" viewBox="0 0 300 12" aria-hidden="true">
            <path d="M4 8 C 70 2, 150 11, 296 4" stroke="#16a34a" strokeWidth="6"
                  fill="none" strokeLinecap="round" />
          </svg>
          <p className="hv-sub" style={{ marginTop: 14 }}>
            Every story follows the same gentle rhythm, so a child always knows what comes next.
          </p>
        </div>
        <div className="hv-steps">
          <div className="hv-step">
            <div className="hv-step-ico" aria-hidden="true">📖</div>
            <h3>Watch the story</h3>
            <p>About two minutes, retold from Scripture with the verse on screen.</p>
          </div>
          <div className="hv-step">
            <div className="hv-step-ico" aria-hidden="true">✅</div>
            <h3>Answer a few questions</h3>
            <p>One at a time, with a streak to chase and stars to win back.</p>
          </div>
          <div className="hv-step">
            <div className="hv-step-ico" aria-hidden="true">💭</div>
            <h3>Reflect on it</h3>
            <p>Tap a card to say what they think. No typing, so little ones can join in.</p>
          </div>
          <div className="hv-step">
            <div className="hv-step-ico" aria-hidden="true">🏆</div>
            <h3>Keep going</h3>
            <p>Levels from Seedling to Bible Master, and the next series unlocks.</p>
          </div>
        </div>
      </section>

      <section className="hv-parents">
        <h2>What parents say</h2>
        <div className="hv-quotes">
          <div className="hv-quote">
            <p>&ldquo;I used to dread handing my kids the iPad. Now my daughter asks for
              &lsquo;the Bible one&rsquo; instead of YouTube. She told her grandmother the whole
              story of Noah last Sunday. My heart.&rdquo;</p>
            <cite>Maria S.<span>Mom of 3 (ages 4, 7 &amp; 10)</span></cite>
          </div>
          <div className="hv-quote">
            <p>&ldquo;Best $13/month I spend. My son watched David &amp; Goliath four times in a
              row and then acted it out in the backyard. That&rsquo;s the kind of screen time I
              can get behind.&rdquo;</p>
            <cite>James K.<span>Dad of 2 (ages 5 &amp; 8)</span></cite>
          </div>
          <div className="hv-quote">
            <p>&ldquo;We cancelled YouTube Kids. This replaced it completely. My kids are watching
              the Good Samaritan instead of whatever the algorithm serves up. No contest.&rdquo;</p>
            <cite>Michael T.<span>Dad of 3 (ages 4, 8 &amp; 11)</span></cite>
          </div>
        </div>
        {/* "christian shows for kids" is 255/mo and the one term where a
            homepage genuinely competes — Minno ranks #1 with its homepage and
            Yippee with theirs. That keyword line carries over from the old
            page; it is the only line on this page written for a search engine
            rather than a parent, and it is still true. */}
        <p className="hv-testi-note">Christian shows for kids that teach, not just entertain.</p>
      </section>

      <section className="hv-pricing" id="pricing">
        <h2>One price. Every story. Every kid in the house.</h2>
        <p>Unlimited kid profiles, all 31 series, on every device you own.</p>
        <div className="hv-plans">
          <div className="hv-plan is-best">
            <p className="hv-plan-name">Monthly</p>
            <p className="hv-price">${MONTHLY}<small> /month</small></p>
            <ul>
              <li>300+ lessons, Genesis to Revelation</li>
              <li>About two minutes each, with a quiz and a reflection</li>
              <li>No ads, no algorithm, no comments</li>
            </ul>
            <TrackedLink
              className="hv-plan-cta"
              href="/checkout?plan=monthly"
              event="pricing_click"
              props={{ tier: 'monthly', price: MONTHLY.toFixed(2) }}
            >
              Get started
            </TrackedLink>
          </div>
          <div className="hv-plan">
            <span className="hv-tag">Save {SAVE_PCT}%</span>
            <p className="hv-plan-name">Yearly</p>
            <p className="hv-price">${ANNUAL}<small> /year &middot; ${PER_MONTH}/mo</small></p>
            <ul>
              <li>Everything in monthly</li>
              <li>Starts with a 7-day free trial</li>
              <li>Cancel any time before it renews</li>
            </ul>
            <TrackedLink
              className="hv-plan-cta"
              href="/checkout?plan=annual"
              event="pricing_click"
              props={{ tier: 'annual', price: ANNUAL.toFixed(2) }}
            >
              Start free trial
            </TrackedLink>
          </div>
        </div>
        <p className="hv-guarantee">
          30-day money-back guarantee. If your kids don&apos;t love it, we refund you.
        </p>
      </section>

      {/* FAQ. Plain <details>, so every answer is in the server HTML whether or
          not it is open and whether or not JavaScript runs. The old accordion
          rendered the answer only while expanded, which meant the text Google
          saw came from the schema alone. */}
      <section className="hv-faq" id="faq">
        <h2>Questions parents ask</h2>
        <p className="hv-faq-sub">Everything you need to know about the Bible app for kids.</p>
        <div className="hv-faq-list">
          {FAQS.map(faq => (
            <details className="hv-faq-item" key={faq.q}>
              <summary>
                <h3>{faq.q}</h3>
                <span className="hv-faq-mark" aria-hidden="true" />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">📖</span>Learn</li>
          <li><span aria-hidden="true">✨</span>Have fun</li>
          <li><span aria-hidden="true">🌱</span>Grow in faith</li>
        </ul>
        <h2>Make screen time the best part of their day</h2>
        <TrackedLink
          className="hv-cta"
          href="/quiz"
          event="cta_click"
          props={{ location: 'close' }}
        >
          <span className="hv-cta-play" aria-hidden="true" />
          Start watching free
        </TrackedLink>
        <p className="hv-close-fine">30-day money-back guarantee &middot; cancel anytime</p>
      </section>

      </main>

      <SiteFooter />

      <HomeExitIntent />
    </div>
  )
}
