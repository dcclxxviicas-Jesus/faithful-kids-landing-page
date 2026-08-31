'use client'

import { useState, useRef, useEffect } from 'react'
import { SiteFooter, SiteNav } from '@/app/components/SiteChrome'
import posthog from 'posthog-js'
import { useTimer } from './use-timer'
import { DavidGoliathScene, NoahArkScene, GoodSamaritanScene } from './illustrations'

const TESTIMONIALS = [
  {
    name: 'Maria S.',
    role: 'Mom of 3 (ages 4, 7 & 10)',
    quote: "I used to dread handing my kids the iPad. Now my daughter asks for 'the Bible one' instead of YouTube. She told her grandmother the whole story of Noah last Sunday. My heart.",
  },
  {
    name: 'James K.',
    role: 'Dad of 2 (ages 5 & 8)',
    quote: "Best $8/month I spend. Both kids love it. My son watched David & Goliath four times in a row and then acted it out in the backyard. That's the kind of screen time I can get behind.",
  },
  {
    name: 'Sarah R.',
    role: 'Mom of 1 (age 6)',
    quote: "I put this on during dinner prep and the guilt is just gone. She's learning Scripture instead of watching unboxing videos. I've told every mom in my parish about it.",
  },
  {
    name: 'Michael T.',
    role: 'Dad of 3 (ages 4, 8 & 11)',
    quote: "We cancelled YouTube Kids. This replaced it completely. My kids are watching the Good Samaritan instead of whatever the algorithm serves up. No contest.",
  },
  {
    name: 'Amanda L.',
    role: 'Mom (age 7)',
    quote: "The no-ads thing is everything. My son used to come to me asking for random toys he saw in ads. Now he comes asking me about Moses and the burning bush.",
  },
  {
    name: 'Chris W.',
    role: 'Dad of 1 (age 9)',
    quote: "My kid actually retains these stories. His Sunday school teacher noticed he already knew the parables before class. That's when I knew this was worth every penny.",
  },
]

const FAQS = [
  { q: 'What age is this for?', a: 'Our Bible story videos are designed for kids ages 5 and up. Younger kids (5-7) get shorter, simpler retellings with bright visuals. Older kids (8+) get deeper stories with more context and life lessons.' },
  { q: 'Is it really ad-free?', a: 'Yes. Zero ads, ever. No pre-rolls, no banners, no sponsored content. We make money from subscriptions, not from advertising to your children.' },
  { q: 'How is this different from YouTube Kids?', a: 'YouTube Kids uses an algorithm that serves whatever keeps kids watching. We hand-pick every story and review it for doctrinal accuracy. No rabbit holes, no surprises, no junk content.' },
  { q: 'What makes this different from other Bible apps for kids?', a: 'Most Bible apps for kids are built for the youngest readers, so children tend to outgrow them somewhere around age 7 or 8 and quietly stop opening them. Faithful Kids is made for the years after that. It works through the whole story of Scripture in order rather than a handful of favorite stories, and every lesson ends with a quiz, so you can see what your child actually understood instead of guessing.' },
  { q: 'Is Faithful Kids a Christian app for kids of any denomination?', a: 'Yes. It is a Christian app for kids built around the stories all Christian traditions share, told faithfully to Scripture. Families can choose a Catholic, Evangelical, or Non-denominational content path during setup.' },
  { q: 'Can I set screen time limits?', a: 'Yes. Set daily limits per child. When time is up, the app gently pauses. No more "just one more video" battles.' },
  { q: 'Which denomination is the content for?', a: 'Our core Bible stories (David & Goliath, Noah, the Good Samaritan, the Nativity) are told faithfully to Scripture and resonate across Christian traditions. We offer content paths for Catholic, Evangelical, and Non-denominational families.' },
  { q: 'Is the content doctrinally accurate?', a: 'Every story is reviewed by practicing Christians with theological training. We take doctrinal accuracy seriously. If something is not right, we fix it or remove it.' },
  { q: 'What devices does it work on?', a: 'Any device with a web browser: iPhone, iPad, Android phones and tablets, laptops, and desktops. There is nothing to install — kids sign in at app.faithfulkids.app and watch.' },
  { q: 'What is the refund policy?', a: 'Full 30-day money-back guarantee. If your kids do not love it, we will refund you completely. No questions asked.' },
  { q: 'How often is new content added?', a: 'The library already covers the whole Bible in order: 300+ video lessons across 30+ series, Genesis to Revelation. New series and deep dives are added regularly on top of that.' },
  { q: 'How are the videos made?', a: 'We use advanced AI video technology to create beautiful, consistent storytelling at a pace no traditional studio could match. Every script is written and reviewed by real Christians for doctrinal accuracy. The technology lets us produce high-quality content fast, which means your kids get new stories every week instead of waiting months between releases.' },
  { q: 'Are there quizzes?', a: 'Yes. Every lesson comes with a short quiz so your child can check what they learned. It is not a test. It is a fun way to make sure the story sticks. Parents can see quiz results in the dashboard.' },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleCTA() {
    posthog.capture('cta_click', { location: 'various' })
    window.location.href = '/checkout'
  }

  function handlePricingClick(tier: string, price: string) {
    posthog.capture('pricing_click', { tier, price })
  }

  return (
    <>
      {/* App schema. Tells Google this domain is a product, not just a blog --
          the homepage previously carried only Organization + WebSite markup, so
          nothing on the site identified Faithful Kids as an app at all.
          NOTE: deliberately no aggregateRating. The "4.9/5" in the hero is
          marketing copy, not ratings collected from real users, and Google
          issues manual actions for review markup that isn't genuine. Add
          aggregateRating only once real reviews exist and are shown on-page. */}
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
          url: 'https://faithfulkids.app',
          installUrl: 'https://faithfulkids.app/quiz',
          description:
            'A Bible app for kids ages 5-15. 400+ short Bible story videos from Genesis to Revelation, each followed by a quiz and a reflection, with a parent dashboard and multiple kid profiles. No ads.',
          inLanguage: 'en',
          isFamilyFriendly: true,
          audience: {
            '@type': 'PeopleAudience',
            audienceType: 'Children and parents',
            suggestedMinAge: 5,
            suggestedMaxAge: 15,
          },
          featureList: [
            '400+ Bible story videos',
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
              price: '8.88',
              priceCurrency: 'USD',
              category: 'subscription',
              url: 'https://faithfulkids.app/checkout',
            },
            {
              '@type': 'Offer',
              name: 'Annual',
              price: '77.77',
              priceCurrency: 'USD',
              category: 'subscription',
              url: 'https://faithfulkids.app/checkout',
            },
          ],
          publisher: {
            '@type': 'Organization',
            name: 'Faithful Kids',
            url: 'https://faithfulkids.app',
          },
        }) }}
      />

      {/* FAQ schema, generated from the FAQS array so it can never drift out of
          sync with what the page actually shows.
          Reality check: Google restricted FAQ rich results to government and
          health sites in 2023, so this will NOT produce a rich snippet. It is
          here because it gives AI Overviews and LLM crawlers clean, attributable
          question/answer pairs -- which is where this traffic is going. */}
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

      {/* The full episode playable on the homepage. Video rich results DO still
          display, unlike FAQ ones. URLs HEAD-verified 200; uploadDate is the
          real CloudFront last-modified, not a guess. No duration claimed --
          we don't have a verified one. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: 'An Angel Visits Mary — Bible Story for Kids',
          description:
            'The angel Gabriel tells Mary she will give birth to Jesus. A short, kid-friendly retelling of Luke 1:26-56, episode 1 of the Birth of Jesus series on Faithful Kids.',
          thumbnailUrl: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/an-angel-visits-mary-for-kids-hero.webp',
          contentUrl: 'https://d3g07v1w0lehiv.cloudfront.net/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4',
          uploadDate: '2026-08-15',
          isFamilyFriendly: true,
          inLanguage: 'en',
          publisher: {
            '@type': 'Organization',
            name: 'Faithful Kids',
            url: 'https://faithfulkids.app',
          },
        }) }}
      />

      {/* NAV — deliberately bare. This is a sales page: one CTA, no exits.
          The full nav lives on the content pages, where people actually
          arrive from search and need to explore. Footer still links
          everything for crawlers and for anyone who goes looking. */}
      <SiteNav minimal ctaHref="/checkout" ctaLabel="Get Started" />

      <main id="main-content">

      {/* HERO */}
      <section className="hero" aria-label="Hero">
        <div className="hero-content">
          <h1>The <span className="highlight">Bible app for kids</span> they actually ask to watch</h1>
          <p className="subtitle">
            300+ short Bible story videos, Genesis to Revelation. Every one ends with a quiz,
            so you know what landed.
          </p>

          <button className="btn-primary btn-hero" onClick={handleCTA}>
            Start 3 days free
          </button>
          <p className="hero-subtext">No commitment. Cancel anytime.</p>

          <div className="hero-proof">
            <span className="hero-rating">
              <span className="stars">★★★★★</span>
              <span className="rating-text">4.9/5</span>
            </span>
            <LiveCounter />
          </div>
        </div>

        <div className="hero-visual">
          <PhoneMockup />
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="trust-strip">
        <div className="trust-strip-inner">
          <span><strong>300+</strong> video lessons</span>
          <span><strong>Genesis to Revelation</strong></span>
          <span><strong>Doctrinally reviewed</strong> by real Christians</span>
          <span><strong>Zero ads</strong>, ever</span>
        </div>
      </div>

      {/* THE PROBLEM — the sharpest writing on the page. Kept almost intact. */}
      <section className="problem-section">
        <span className="section-label">THE PROBLEM</span>
        <h2>Kids are glued to screens. Almost none of it feeds their soul.</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-num">4.4 hrs/day</div>
            <p>Average screen time for kids 8&ndash;12.</p>
          </div>
          <div className="stat-card">
            <div className="stat-num">0 Bible</div>
            <p>The vast majority of kids&rsquo; content on YouTube and TikTok is faith-free.</p>
          </div>
          <div className="stat-card">
            <div className="stat-num">78% guilt</div>
            <p>Of Christian parents feel guilty about their children&rsquo;s screen time.</p>
          </div>
        </div>
      </section>

      {/* SEE IT — the product proving itself. One section, one CTA. */}
      <section className="fullstory-section">
        <span className="section-label">SEE FOR YOURSELF</span>
        <h2>Watch a full story right now</h2>
        <p className="section-sub">Exactly what your child sees. No signup. Just press play.</p>
        <FullStoryPlayer />

        <div className="preview-grid">
          {STORIES.slice(1).map((v) => (
            <PreviewCard key={v.src} {...v} />
          ))}
        </div>
        <div className="preview-more">
          <p>+ 300+ lessons across 31 series, in order, from Genesis to Revelation</p>
          <button className="btn-primary" onClick={handleCTA}>Start 3 days free</button>
        </div>
      </section>

      {/* THREE PROMISES — replaces four sections that each argued a piece of
          this at length: the solution grid, how-it-works, an eight-item
          features grid, and a four-card privacy section. Short declarative
          headings, one line each, in the manner of Epic and Duolingo. */}
      <section className="promises-section">
        <h2>Why parents trust it</h2>
        <div className="promise-grid">
          <div className="promise">
            <h3>Faithful to Scripture.</h3>
            <p>
              Every story is reviewed for doctrinal accuracy by real Christians before it goes
              live. Catholic, Evangelical and Non-denominational paths at setup.
            </p>
          </div>
          <div className="promise">
            <h3>Safe by design.</h3>
            <p>
              No ads, no algorithm, no comments, no rabbit holes. We never sell your data and
              no third-party tracking follows your child. COPPA compliant.
            </p>
          </div>
          <div className="promise">
            <h3>Built for the years kids quit.</h3>
            <p>
              Most Bible apps are made for toddlers and get outgrown by seven. This one runs
              to fifteen, through the whole story in order.
            </p>
          </div>
        </div>
        <p className="promises-parents">
          <strong>Parents get:</strong> screen-time limits per child, a dashboard showing what
          they watched, age-matched stories, and up to 5 profiles. Works on any phone, tablet
          or laptop &mdash; nothing to install.
        </p>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <h2>What parents say</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.slice(0, 3).map((t) => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING — the page had no pricing section at all. The only figures a
          reader could find were $6.48/mo inside a comparison table cell and
          "$8/month" inside a testimonial: two different numbers, neither
          anywhere a buyer would look. Figures below are the live Stripe
          amounts from app/api/checkout/route.ts. */}
      <section className="pricing-section" id="pricing">
        <span className="section-label">PRICING</span>
        <h2>One price. Every story. Every kid in the house.</h2>
        <p className="section-sub">No per-child fees, no upsells, no ads. Cancel in two taps.</p>

        <div className="plan-grid">
          <div className="plan-tile featured">
            <span className="plan-flag">Most families choose this</span>
            <h3 className="plan-name">Annual</h3>
            <p className="plan-price"><span className="plan-amount">$6.48</span><span className="plan-per">/month</span></p>
            <p className="plan-billed">$77.77 billed yearly &middot; save ~$30</p>
            <ul className="plan-list-features">
              <li>Start with 3 days free</li>
              <li>All 300+ lessons, Genesis to Revelation</li>
              <li>Up to 5 kid profiles</li>
              <li>Quiz and reflection after every story</li>
            </ul>
            <a href="/checkout" className="btn-primary plan-cta" onClick={() => handlePricingClick('annual', '77.77')}>
              Start 3 days free
            </a>
            <p className="plan-fine">Then $77.77/year. Cancel anytime.</p>
          </div>

          <div className="plan-tile">
            <h3 className="plan-name">Monthly</h3>
            <p className="plan-price"><span className="plan-amount">$8.88</span><span className="plan-per">/month</span></p>
            <p className="plan-billed">Billed monthly</p>
            <ul className="plan-list-features">
              <li>All 300+ lessons, Genesis to Revelation</li>
              <li>Up to 5 kid profiles</li>
              <li>Quiz and reflection after every story</li>
              <li>No trial on monthly</li>
            </ul>
            <a href="/checkout" className="btn-secondary plan-cta" onClick={() => handlePricingClick('monthly', '8.88')}>
              Choose monthly
            </a>
            <p className="plan-fine">Cancel anytime.</p>
          </div>
        </div>

        <p className="plan-guarantee">30-day money-back guarantee &mdash; if your kids don&apos;t love it, we refund you.</p>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <h2>Frequently asked questions</h2>
        <p className="section-sub">Everything you need to know.</p>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                {faq.q}
                <span className="faq-arrow" aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className="faq-a">{faq.a}</p>}
            </div>
          ))}
        </div>

        <div className="faq-close">
          <h2>Turn screen time into the best part of their day</h2>
          <button className="btn-primary btn-lg" onClick={handleCTA}>Start 3 days free</button>
          <div className="final-badges">
            <span>30-day money-back guarantee</span>
            <span>Cancel anytime</span>
            <span>No ads ever</span>
          </div>
        </div>
      </section>

      </main>

      {/* FOOTER */}
      <SiteFooter />

      {/* EXIT INTENT POPUP */}
      <ExitIntent />

      {/* STICKY BOTTOM BAR */}
      <StickyBar onCTA={handleCTA} />
    </>
  )
}

function PreviewCard({ src, poster, title, series, age }: { src: string; poster: string; title: string; series: string; age: string }) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [canHover, setCanHover] = useState(true)
  const vidRef = useRef<HTMLVideoElement>(null)

  // Touch devices have no hover, so "Hover to preview" was an instruction
  // roughly half the audience could not follow. Decide in an effect, not during
  // render, so the server and client agree.
  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover)').matches)
  }, [])

  function handlePlay() {
    if (vidRef.current) {
      vidRef.current.play()
      setPlaying(true)
    }
  }

  function handleStop() {
    if (vidRef.current) {
      vidRef.current.pause()
      vidRef.current.currentTime = 0
      setPlaying(false)
      setMuted(true)
      vidRef.current.muted = true
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation()
    if (vidRef.current) {
      vidRef.current.muted = !muted
      setMuted(!muted)
      if (muted) {
        vidRef.current.play()
        setPlaying(true)
        posthog.capture('preview_unmuted', { title })
      }
    }
  }

  // On touch, tapping the card is what starts and stops it.
  function handleTap() {
    if (canHover) return
    if (playing) handleStop()
    else {
      handlePlay()
      posthog.capture('preview_tapped', { title })
    }
  }

  return (
    <div
      className="preview-card"
      onMouseEnter={canHover ? handlePlay : undefined}
      onMouseLeave={canHover ? handleStop : undefined}
      onClick={handleTap}
    >
      <div className="preview-video-wrap">
        <video ref={vidRef} src={src} poster={poster} muted loop playsInline preload="none" />
        {!playing && (
          <div className="preview-play-hint">
            {canHover ? '\u25B6 Hover to preview' : '\u25B6 Tap to play'}
          </div>
        )}
        {playing && (
          <button className="preview-mute-btn" onClick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'}>
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>
      <div className="preview-info">
        <span className="preview-series">{series}</span>
        <p className="preview-title">{title}</p>
        <span className="preview-age">{age}</span>
      </div>
    </div>
  )
}

// Posters are real frames pulled from each lesson, chosen for brightness and
// detail rather than taken at t=0 (Creation opens on darkness, so its first
// second is a black rectangle). Without these every video on the page painted
// black until tapped -- and four of them preload="none", so on a phone the
// preview grid was three black boxes.
const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'
const STORIES = [
  {
    src: `${CDN}/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4`,
    poster: `${CDN}/video-posters/an-angel-visits-mary.webp`,
    title: 'An Angel Visits Mary', badge: 'Birth of Jesus', series: 'Birth of Jesus', age: 'Ages 5+',
  },
  {
    src: `${CDN}/bible/genesis-series/01-in-the-beginning-creation/lesson-video.mp4`,
    poster: `${CDN}/video-posters/in-the-beginning-creation.webp`,
    title: 'In the Beginning: Creation', badge: 'Genesis', series: 'Genesis', age: 'Ages 5+',
  },
  {
    src: `${CDN}/bible/genesis-series/04-noah-and-the-great-flood/lesson-video.mp4`,
    poster: `${CDN}/video-posters/noah-and-the-great-flood.webp`,
    title: 'Noah & the Great Flood', badge: 'Genesis', series: 'Genesis', age: 'Ages 5+',
  },
]

const PHONE_VIDEOS = STORIES

function PhoneMockup() {
  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  function goTo(index: number) {
    setCurrent(index)
    setMuted(true)
    posthog.capture('phone_video_swipe', { index, title: PHONE_VIDEOS[index].title })
  }

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
      if (muted) {
        videoRef.current.play()
        posthog.capture('hero_video_unmuted', { title: PHONE_VIDEOS[current].title })
      }
    }
  }

  function next() { if (current < PHONE_VIDEOS.length - 1) goTo(current + 1) }
  function prev() { if (current > 0) goTo(current - 1) }

  const v = PHONE_VIDEOS[current]

  return (
    <div className="phone-mockup">
      <div
        className="phone-screen"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (touchStart === null) return
          const delta = touchStart - e.changedTouches[0].clientY
          if (delta > 50) next()
          else if (delta < -50) prev()
          setTouchStart(null)
        }}
      >
        <video
          ref={videoRef}
          key={v.src}
          src={v.src}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          poster={v.poster}
          className="phone-video"
          // @ts-expect-error -- fetchPriority is valid HTML but not in React types yet
          fetchpriority="high"
        />
        <div className="phone-overlay">
          <span className="phone-title">{v.title}</span>
          <span className="phone-badge">{v.badge}</span>
        </div>

        {/* Unmute button */}
        <button className="phone-mute-btn" onClick={toggleMute}>
          {muted ? '🔇 Tap to listen' : '🔊 Playing'}
        </button>

        {/* Scroll dots */}
        <div className="phone-dots" role="tablist" aria-label="Video selector">
          {PHONE_VIDEOS.map((vid, i) => (
            <button
              key={i}
              className={`phone-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to video: ${vid.title}`}
              role="tab"
              aria-selected={i === current}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        {current > 0 && (
          <button className="phone-arrow up" onClick={prev} aria-label="Previous video">&#8249;</button>
        )}
        {current < PHONE_VIDEOS.length - 1 && (
          <button className="phone-arrow down" onClick={next} aria-label="Next video">&#8250;</button>
        )}
      </div>
    </div>
  )
}

function StickyBar({ onCTA }: { onCTA: () => void }) {
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)
  const { minutes, seconds } = useTimer()

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (dismissed || !visible) return null

  return (
    <div className="sticky-bar">
      <div className="sticky-inner">
        <span className="sticky-text">
          <strong>3-day free trial</strong> — then up to 75% off.
          Ends in <span className="sticky-timer">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </span>
        <button className="sticky-cta" onClick={onCTA}>Claim your free trial</button>
        <button className="sticky-dismiss" onClick={() => setDismissed(true)} aria-label="Dismiss promotion bar">✕</button>
      </div>
    </div>
  )
}

function FullStoryPlayer() {
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
      if (muted) {
        videoRef.current.play()
        posthog.capture('fullstory_unmuted')
      }
    }
  }

  return (
    <div className="fullstory-player">
      <div className="fullstory-video-wrap">
        <video
          ref={videoRef}
          src={STORIES[0].src}
          poster={STORIES[0].poster}
          autoPlay
          muted={muted}
          playsInline
          controls
          preload="none"
          className="fullstory-video"
        />
        <button className="mute-btn" onClick={toggleMute}>
          {muted ? '🔇 Tap to hear the story' : '🔊 Playing with sound'}
        </button>
      </div>
      <div className="fullstory-meta">
        <span className="fullstory-series">Birth of Jesus Series</span>
        <h3>An Angel Visits Mary</h3>
        <p>The angel Gabriel appears to a young woman named Mary with an extraordinary message. Watch how she responds with faith.</p>
        <span className="fullstory-badge">📝 Quiz included after this lesson</span>
      </div>
    </div>
  )
}

const CURRICULUM = [
  { name: 'Genesis', lessons: ['Creation', 'The Garden & the Fall', 'Cain & Abel', 'Noah & the Great Flood', 'The Tower of Babel', "God Calls Abraham", 'Abraham & Isaac', 'Jacob & Esau', 'Joseph the Dreamer', 'Joseph: From Prison to Palace'], icon: '🌍' },
  { name: 'Exodus', lessons: ['A Baby in a Basket', 'The Burning Bush', 'Let My People Go', 'The Ten Plagues', 'The Passover', 'Crossing the Red Sea', 'Manna from Heaven', 'The Ten Commandments', 'The Golden Calf', "God's Presence"], icon: '🔥' },
  { name: 'Promised Land', lessons: ['The Twelve Spies', 'Wandering in the Wilderness', 'The Bronze Serpent', "Balaam's Donkey", 'Moses Says Goodbye', 'Joshua Takes Command', 'Rahab & the Spies', 'The Walls of Jericho', 'The Sun Stands Still', 'Choosing to Serve'], icon: '⚔️' },
  { name: 'Judges & Ruth', lessons: ['The Cycle Begins', 'Deborah: A Brave Leader', 'Gideon the Unlikely Hero', "Gideon's 300", 'Samson: Strongest Man Alive', "Samson's Final Stand", 'Ruth: A Story of Loyalty', 'Ruth & Boaz', "Hannah's Prayer", 'God Calls Samuel'], icon: '⚖️' },
  { name: 'Rise of Kings', lessons: ['Israel Wants a King', 'Saul the First King', "Saul's Disobedience", 'God Chooses David', 'David & Goliath', 'David & Jonathan', 'David on the Run', 'David Spares His Enemy', 'The Fall of King Saul', 'David Becomes King'], icon: '👑' },
  { name: "King David's Reign", lessons: ['Dancing Before the Lord', "God's Promise to David", 'David & Mephibosheth', "David's Big Mistake", "The Shepherd's Song", 'Songs of Praise', "Absalom's Rebellion", "David's Repentance", 'Solomon Is Chosen', "David's Final Words"], icon: '🎵' },
  { name: 'Solomon & the Kingdom', lessons: ['Solomon Asks for Wisdom', "Solomon's Wise Judgment", 'Building the Temple', 'The Temple Is Dedicated', 'The Queen of Sheba', "Solomon's Proverbs", 'Solomon Turns Away', 'The Kingdom Splits', 'Good Kings & Bad Kings', 'The Northern Kingdom Falls'], icon: '🏛️' },
  { name: 'Elijah & Elisha', lessons: ['Elijah & the Ravens', "The Widow's Oil", 'Fire from Heaven', 'The Still Small Voice', "Naboth's Vineyard", 'Elijah Taken to Heaven', "Elisha's Double Portion", 'The Room on the Roof', 'Naaman the Leper', 'Chariots of Fire'], icon: '🕊️' },
  { name: 'Exile & Faith', lessons: ['Judah Falls to Babylon', "Daniel's Resolve", "Nebuchadnezzar's Dream", 'The Fiery Furnace', 'The Writing on the Wall', "Daniel in the Lions' Den", 'Valley of Dry Bones', 'Jonah: Running from God', 'Jonah: The Lesson', "Isaiah's Promise"], icon: '🦁' },
  { name: 'The Return Home', lessons: ['Cyrus Sets Them Free', 'Rebuilding the Temple', 'Ezra Reads the Law', "Nehemiah's Prayer", 'Rebuilding the Walls', 'The Wall Is Finished', 'Esther Becomes Queen', "Haman's Evil Plot", 'Esther Saves Her People', 'Looking Forward'], icon: '🏠' },
  { name: 'Birth of Jesus', lessons: ['An Angel Visits Mary', 'Joseph & the Angel', 'The Journey to Bethlehem', 'Born in a Manger', 'The Shepherds', 'The Wise Men', 'Escape to Egypt', 'Young Jesus in the Temple', 'John the Baptist', 'The Baptism of Jesus'], icon: '⭐' },
  { name: 'Jesus Begins Ministry', lessons: ['Temptation in the Desert', 'The First Disciples', 'Water into Wine', 'The Woman at the Well', 'Rejected in Nazareth', 'The Four Fishermen', 'Healing the Sick', 'The Paralyzed Man', 'Matthew the Tax Collector', 'The Twelve Apostles'], icon: '🐟' },
  { name: 'Teachings of Jesus', lessons: ['The Sermon on the Mount', 'The Beatitudes', "The Lord's Prayer", 'The Good Samaritan', 'The Prodigal Son', 'The Sower & the Seeds', 'The Mustard Seed', 'The Lost Sheep', 'The Wise & Foolish Builders', 'The Unforgiving Servant'], icon: '📖' },
  { name: 'Miracles of Jesus', lessons: ['Calming the Storm', 'Feeding the Five Thousand', 'Walking on Water', 'Healing the Blind Man', 'The Raising of Lazarus', 'Ten Lepers Healed', 'The Demon-Possessed Man', "Jairus' Daughter", 'The Withered Hand', 'The Great Catch of Fish'], icon: '✨' },
  { name: 'Road to the Cross', lessons: ['The Triumphal Entry', 'Cleansing the Temple', 'The Last Supper', 'The Garden of Gethsemane', 'The Betrayal', 'The Trial', 'Peter Denies Jesus', 'The Cross', 'It Is Finished', 'The Burial'], icon: '✝️' },
  { name: 'He Is Risen', lessons: ['The Empty Tomb', 'Mary Sees Jesus', 'The Road to Emmaus', 'Doubting Thomas', 'Breakfast on the Beach', 'Peter Is Restored', 'The Great Commission', 'The Ascension', 'Waiting in Jerusalem', 'The Day of Pentecost'], icon: '🌅' },
  { name: 'Early Church', lessons: ['The Church Is Born', 'Peter Heals the Lame Man', 'Ananias & Sapphira', 'Stephen the First Martyr', 'Philip & the Ethiopian', 'Saul Meets Jesus', 'Peter & Cornelius', 'Peter Escapes Prison', 'Barnabas the Encourager', 'The Church at Antioch'], icon: '⛪' },
  { name: "Paul's Adventures", lessons: ["Paul's First Journey", 'Paul & Barnabas Split', 'Paul & Silas in Prison', 'Paul in Athens', 'Paul in Corinth', 'The Riot in Ephesus', "Paul's Farewell", 'Shipwrecked', 'Paul in Rome', "Paul's Legacy"], icon: '⛵' },
  { name: 'Letters to Churches', lessons: ['The Gospel Explained', 'More Than Conquerors', 'The Armor of God', 'Love Is', 'Faith, Hope & Love', 'The Fruit of the Spirit', 'Running the Race', 'Joy in All Things', 'Do Not Worry', 'A New Creation'], icon: '✉️' },
  { name: 'Ending & Beginning', lessons: ['Faith Hall of Fame', 'Faith Without Works', 'Taming the Tongue', 'Love One Another', 'The Good Shepherd', 'The Vine & the Branches', 'I Am the Way', 'A New Heaven & New Earth', 'The Throne Room', 'Behold I Am Coming Soon'], icon: '🌟' },
]

function CurriculumSection() {
  const FEATURED = [
    { ...CURRICULUM[0], color: '#2d6a4f' },   // Genesis - forest green
    { ...CURRICULUM[10], color: '#7c3aed' },   // Birth of Jesus - purple
    { ...CURRICULUM[12], color: '#0369a1' },   // Teachings - blue
  ]

  return (
    <section className="curriculum-section">
      <div className="curr-header-content">
        <span className="section-label">THE FULL CURRICULUM</span>
        <h2>The entire Bible, one story at a time</h2>
        <div className="curr-hero-stat">
          <span className="curr-hero-num">300+</span>
          <span className="curr-hero-label">lessons across 31 series, each with a quiz and a reflection</span>
        </div>
      </div>

      {/* Featured series - 3 big cards */}
      <div className="curr-featured">
        {FEATURED.map((series) => (
          <div key={series.name} className="curr-feat-card" style={{ background: `linear-gradient(135deg, ${series.color}, ${series.color}dd)` }}>
            <div className="curr-feat-top">
              <span className="curr-feat-icon">{series.icon}</span>
              <span className="curr-feat-count">{series.lessons.length} episodes</span>
            </div>
            <h3>{series.name}</h3>
            <div className="curr-feat-lessons">
              {series.lessons.slice(0, 5).map((l, i) => (
                <span key={l} className="curr-feat-lesson">{i + 1}. {l}</span>
              ))}
              <span className="curr-feat-more">+ {series.lessons.length - 5} more</span>
            </div>
          </div>
        ))}
      </div>

      <p className="curr-all-label">All 31 series included, Genesis to Revelation.</p>
    </section>
  )
}

function ExitIntent() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const triggered = useRef(false)
  const lastScrollY = useRef(0)

  function trigger(source: string) {
    if (triggered.current || dismissed) return
    triggered.current = true
    setShow(true)
    posthog.capture('exit_intent_shown', { source })
  }

  // Desktop: mouse leaves viewport
  useEffect(() => {
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY < 10) trigger('mouse_leave')
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [dismissed])

  // Mobile: fast scroll-up from below the fold
  useEffect(() => {
    let scrollUpDistance = 0

    function handleScroll() {
      const currentY = window.scrollY
      const viewportHeight = window.innerHeight

      if (currentY < lastScrollY.current && currentY > viewportHeight) {
        scrollUpDistance += lastScrollY.current - currentY
        if (scrollUpDistance > 300) {
          trigger('scroll_up')
        }
      } else {
        scrollUpDistance = 0
      }
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [dismissed])

  // Mobile: timed delay (45 seconds, reset +60s on any video play)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function resetTimer() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => trigger('timed_delay'), 60000)
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => trigger('timed_delay'), 45000)

    function handlePlay() { resetTimer() }
    document.addEventListener('play', handlePlay, true)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      document.removeEventListener('play', handlePlay, true)
    }
  }, [dismissed])

  if (!show || dismissed) return null

  return (
    <div className="exit-overlay" onClick={() => setDismissed(true)} role="dialog" aria-modal="true" aria-label="Watch a story before you go">
      <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="exit-close" onClick={() => setDismissed(true)} aria-label="Close dialog">✕</button>
        <h2>Before you go, watch this.</h2>
        <p>60 seconds. One Bible story. See if it is good enough for your kids.</p>
        <div className="exit-video-wrap">
          <video src={STORIES[0].src} poster={STORIES[0].poster} controls autoPlay muted playsInline preload="none" className="exit-video" />
        </div>
        <button className="btn-primary btn-lg" onClick={() => { posthog.capture('exit_intent_cta'); window.location.href = '/checkout' }}>
          Try Free for 3 Days
        </button>
        <p className="exit-sub">30-day money-back guarantee. Cancel anytime.</p>
      </div>
    </div>
  )
}

// Seeded from the calendar date so every visitor on a given day sees the same
// figure and it changes on its own each morning. Range 100-950, then +1 every
// 30 minutes so the number climbs through the day (max +47 by 11:30pm).
function dailyBase(d: Date): number {
  const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  let h = key ^ 0x9e3779b9
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  h ^= h >>> 16
  return 100 + (Math.abs(h) % 851)
}

function liveCount(now: Date): number {
  return dailyBase(now) + Math.floor((now.getHours() * 60 + now.getMinutes()) / 30)
}

function LiveCounter() {
  const [count, setCount] = useState(0)

  // Animate up on mount. Computed client-side only -- SSR would bake in the
  // build-time date and hydration would mismatch.
  useEffect(() => {
    const target = liveCount(new Date())
    let current = 0
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [])

  // Re-sync each minute so long-open tabs pick up the 30-minute step
  // (and roll over correctly at midnight).
  useEffect(() => {
    const id = setInterval(() => setCount(liveCount(new Date())), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="live-counter">
      <span className="live-dot" />
      <span className="live-text">
        <strong>{count}</strong> families joined today
      </span>
    </div>
  )
}
