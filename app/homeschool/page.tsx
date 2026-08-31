import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '../components/SiteChrome'
import { LessonSamples } from '../components/LessonSamples'

export const metadata: Metadata = {
  // The root layout appends ' | Faithful Kids' (16 chars), so this has to stay
  // under ~44 to clear the 60-char check.
  title: 'Homeschool Bible Curriculum, Ages 5-15',
  description:
    'A video homeschool Bible curriculum for ages 5-15: 300+ short lessons in order, Genesis to Revelation, each with a quiz. No prep, no printing.',
  alternates: { canonical: 'https://faithfulkids.app/homeschool' },
  openGraph: {
    title: 'Homeschool Bible Curriculum — 300+ Video Lessons',
    description:
      '300+ short Bible lessons in canonical order, each with a quiz and reflection. Built for ages 5-15. No prep, no printing.',
    url: 'https://faithfulkids.app/homeschool',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/bible-stories-for-homeschool-hero.webp',
      width: 1792, height: 1024,
      alt: 'Faithful Kids homeschool Bible curriculum',
    }],
  },
}

const FAQS = [
  {
    q: 'Is this a complete homeschool Bible curriculum?',
    a: 'It covers the biblical narrative in order across 31 series and 300+ lessons, Genesis to Revelation, with a comprehension quiz and a reflection question after every lesson. It is designed to be the Bible spine of your week rather than a theology course — most families run it as a 10-20 minute daily block.',
  },
  {
    q: 'What ages does it work for?',
    a: 'Ages 5 to 15. You set each child’s age at setup and the stories are matched to their level, so a six-year-old and a twelve-year-old can work through the same series without one being bored and the other lost.',
  },
  {
    q: 'How long does a lesson take?',
    a: 'Each video runs about two minutes, and the quiz and reflection add a few more. A typical sitting is 5-10 minutes for one child, which is why it works as a morning-basket item rather than a whole subject block.',
  },
  {
    q: 'Do I need to prepare anything?',
    a: 'No. There is nothing to print, no teacher guide to read the night before, and no lesson planning. Open it, press play, and the quiz follows automatically.',
  },
  {
    q: 'How do I know what my child actually learned?',
    a: 'Every lesson ends with a comprehension quiz, and the parent dashboard shows what each child watched and how they scored. That is the difference between a video your child watched and a lesson your child absorbed.',
  },
  {
    q: 'Can I use it with more than one child?',
    a: 'Yes. One subscription covers up to five kid profiles, each with their own age setting and progress. There are no per-child fees.',
  },
  {
    q: 'What does it cost?',
    a: 'The annual plan is $77.77 a year, which works out to $6.48 a month, and starts with a 3-day free trial. Monthly is $8.88 with no trial. Both include everything, and there is a 30-day money-back guarantee.',
  },
  {
    q: 'Is it doctrinally safe for our family?',
    a: 'Every story is reviewed for doctrinal accuracy by real people before it goes live, and it is built around the narrative all Christian traditions share. You choose a Catholic, Evangelical or Non-denominational path at setup.',
  },
]

export default function Homeschool() {
  return (
    <>
      <SiteNav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'Faithful Kids Homeschool Bible Curriculum',
            description:
              '300+ short Bible video lessons for ages 5-15, in canonical order from Genesis to Revelation, each with a comprehension quiz and reflection.',
            provider: { '@type': 'Organization', name: 'Faithful Kids', url: 'https://faithfulkids.app' },
            educationalLevel: 'Elementary and Middle School',
            teaches: 'The biblical narrative from Genesis to Revelation',
            isAccessibleForFree: false,
            hasCourseInstance: {
              '@type': 'CourseInstance',
              courseMode: 'online',
              courseWorkload: 'PT10M',
            },
            offers: {
              '@type': 'Offer',
              price: '77.77',
              priceCurrency: 'USD',
              category: 'subscription',
              url: 'https://faithfulkids.app/checkout',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      <main id="main-content">
        {/* Hero */}
        <section className="blog-hero" style={{ paddingBottom: 32 }}>
          <span className="section-label">For Homeschool Families</span>
          <h1>
            A <span style={{ color: 'var(--primary)' }}>homeschool Bible curriculum</span> your
            kids will actually sit through
          </h1>
          <p className="blog-hero-sub">
            300+ short video lessons covering the whole Bible in order, Genesis to Revelation.
            Each one ends with a comprehension quiz, so you find out what your child understood
            instead of hoping. No prep, no printing, no teacher guide.
          </p>
          <a
            href="/checkout"
            className="btn-primary btn-hero"
            style={{ textDecoration: 'none', maxWidth: '100%' }}
          >
            Start 3 days free →
          </a>
          <p className="blog-hero-note">
            $6.48/month billed yearly. Cancel anytime, 30-day money-back guarantee.
          </p>
        </section>

        {/* The stat bar */}
        <div className="trust-strip">
          <div className="trust-strip-inner">
            <span><strong>300+</strong> video lessons</span>
            <span><strong>31</strong> series, in canonical order</span>
            <span><strong>Ages 5&ndash;15</strong> in one subscription</span>
            <span><strong>5</strong> kid profiles included</span>
          </div>
        </div>

        {/* Why it fits a homeschool week */}
        <section className="promises-section">
          <div className="promise-grid">
            <div className="promise">
              <h2>Open and go.</h2>
              <p>
                Nothing to print, no teacher guide to read the night before, no planning. Press
                play and the quiz follows on its own.
              </p>
            </div>
            <div className="promise">
              <h2>In order, not on shuffle.</h2>
              <p>
                31 series that run Genesis to Revelation in sequence, so your children build one
                continuous story instead of collecting favourites.
              </p>
            </div>
            <div className="promise">
              <h2>You see what landed.</h2>
              <p>
                A comprehension quiz after every lesson and a parent dashboard with each
                child&rsquo;s scores. Watching is not the same as learning.
              </p>
            </div>
          </div>
        </section>

        {/* Real lessons, playable. A parent will not buy a video curriculum
            without watching one. */}
        <section className="fullstory-section">
          <span className="section-label">SEE THE LESSONS</span>
          <h2>Watch three real lessons right now</h2>
          <p className="section-sub">
            No signup, no email. This is exactly what your child sees.
          </p>
          <LessonSamples />
          <p className="section-sub library-note">
            Every lesson in the curriculum looks like this &mdash; about two minutes,
            narrated and illustrated, followed by a comprehension quiz and one reflection
            question. There are 300+ of them, in order.
          </p>
        </section>

        {/* How a day looks */}
        <section className="how-section">
          <span className="section-label">In Practice</span>
          <h2>What a day looks like</h2>
          <p className="section-sub">
            Most families run it as a 10&ndash;20 minute morning block.
          </p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Watch</h3>
              <p>One roughly two-minute story, narrated and illustrated, matched to your child&rsquo;s age.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Quiz</h3>
              <p>Three comprehension questions on what just happened. Instant feedback, retry allowed.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Reflect</h3>
              <p>One question to talk about together. No typing required &mdash; tappable answers.</p>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <h3>You check</h3>
              <p>The dashboard shows what each child watched and scored, so nothing needs marking.</p>
            </div>
          </div>

          <ul className="how-extras">
            <li><strong>Multi-age</strong> &mdash; one subscription, five profiles, each age-matched</li>
            <li><strong>No screens battle</strong> &mdash; ad-free, no algorithm, no suggested videos</li>
            <li><strong>Any device</strong> &mdash; phone, tablet or laptop, nothing to install</li>
            <li><strong>Free printables</strong> &mdash; <a href="/printables">coloring pages and word searches</a> to pair with the lessons</li>
          </ul>
        </section>

        {/* Pricing */}
        <section className="pricing-section" id="pricing">
          <span className="section-label">PRICING</span>
          <h2>One price for the whole family</h2>
          <p className="section-sub">No per-child fees, no upsells, no ads.</p>

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
                <li>Quiz and reflection after every lesson</li>
              </ul>
              <a href="/checkout" className="btn-primary plan-cta">Start 3 days free</a>
              <p className="plan-fine">Then $77.77/year. Cancel anytime.</p>
            </div>

            <div className="plan-tile">
              <h3 className="plan-name">Monthly</h3>
              <p className="plan-price"><span className="plan-amount">$8.88</span><span className="plan-per">/month</span></p>
              <p className="plan-billed">Billed monthly</p>
              <ul className="plan-list-features">
                <li>All 300+ lessons, Genesis to Revelation</li>
                <li>Up to 5 kid profiles</li>
                <li>Quiz and reflection after every lesson</li>
                <li>No trial on monthly</li>
              </ul>
              <a href="/checkout" className="btn-secondary plan-cta">Choose monthly</a>
              <p className="plan-fine">Cancel anytime.</p>
            </div>
          </div>

          <p className="plan-guarantee">
            30-day money-back guarantee &mdash; if it does not fit your homeschool, we refund you.
          </p>
        </section>

        {/* FAQ */}
        <section className="faq-section" id="faq">
          <h2>Homeschool questions</h2>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-q">{f.q}</summary>
                <p className="faq-a">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="faq-close">
            <h2>Try it with your family for three days</h2>
            <a href="/checkout" className="btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Start 3 days free
            </a>
            <div className="final-badges">
              <span>30-day money-back guarantee</span>
              <span>Cancel anytime</span>
              <span>No ads ever</span>
            </div>
          </div>
        </section>

        {/* Related reading */}
        <section className="preview-section" style={{ paddingTop: 0 }}>
          <p className="section-sub">
            More for homeschool families:{' '}
            <a href="/blog/homeschool-bible-curriculum-comparison">how the main Bible curricula compare</a>,{' '}
            <a href="/blog/bible-stories-for-homeschool">a 40-week Bible story plan</a>, and{' '}
            <a href="/printables">free printables</a>.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
