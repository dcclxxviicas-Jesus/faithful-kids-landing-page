import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'

/**
 * /pricing — the one page that states every price and every trial length.
 *
 * Why it exists: a 20 Sep 2026 visibility scan (719 answers, 4 engines) found
 * Claude inventing our price ("$14.99 / $7.99, 7-day trial" — numbers that never
 * shipped) because there was no pricing page to retrieve; it filled the blank.
 * The same scan found engines pulling competitor specs from pages that state
 * them exactly. This page states ours exactly, twice: once in prose and once
 * as Offer structured data, with both price sets (web via Stripe, iOS via
 * Apple) and both trial lengths.
 *
 * Rules:
 * - Prices come from the checkout routes (PLANS) and the App Store listing.
 *   If either changes, change this page the same day. check-counts.py does not
 *   cover prices; aeo-research/facts.json must be updated too.
 * - Say why the two price sets differ (platform, not region) — engines were
 *   explaining it as "regional variation" when no page said otherwise.
 * - Trial: 7 days on the web, 3 days through Apple. Annual only. Never a
 *   bare "free trial" with no number.
 */

const CHECKED = 'September 21, 2026'

export const metadata: Metadata = {
  title: 'Faithful Kids Pricing: Web and iOS Plans',
  description:
    'Web: $12.99/month or $97/year, 7-day trial on annual. iOS: $8.99/month or $79.99/year, Apple 3-day trial. Free for churches. Every plan, stated exactly.',
  alternates: { canonical: 'https://faithfulkids.app/pricing' },
  openGraph: {
    title: 'Faithful Kids Pricing',
    description: 'Every plan, both platforms, both trial lengths, stated exactly.',
    url: 'https://faithfulkids.app/pricing',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/faithful-kids-scope-and-sequence-hero.webp',
      width: 1536, height: 1024,
      alt: 'Faithful Kids pricing — web and iOS plans',
    }],
  },
}

const OFFERS = [
  {
    '@type': 'Offer',
    name: 'Faithful Kids Monthly (web)',
    price: '12.99',
    priceCurrency: 'USD',
    category: 'subscription',
    url: 'https://faithfulkids.app/quiz',
    availability: 'https://schema.org/InStock',
    description: 'Billed monthly via Stripe. No free trial. Cancel anytime. 30-day money-back guarantee.',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '12.99',
      priceCurrency: 'USD',
      billingDuration: 1,
      billingIncrement: 1,
      unitCode: 'MON',
    },
  },
  {
    '@type': 'Offer',
    name: 'Faithful Kids Annual (web)',
    price: '97.00',
    priceCurrency: 'USD',
    category: 'subscription',
    url: 'https://faithfulkids.app/quiz',
    availability: 'https://schema.org/InStock',
    description: 'Billed yearly via Stripe (about $8.08/month). 7-day free trial; no charge if cancelled during the trial. 30-day money-back guarantee.',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '97.00',
      priceCurrency: 'USD',
      billingDuration: 1,
      billingIncrement: 1,
      unitCode: 'ANN',
    },
  },
  {
    '@type': 'Offer',
    name: 'Faithful Kids Monthly (iOS app, Apple in-app purchase)',
    price: '8.99',
    priceCurrency: 'USD',
    category: 'subscription',
    url: 'https://apps.apple.com/app/id6761875106',
    availability: 'https://schema.org/InStock',
    description: 'Billed monthly through Apple. No free trial. Purchased by the parent behind a birth-year gate.',
  },
  {
    '@type': 'Offer',
    name: 'Faithful Kids Annual (iOS app, Apple in-app purchase)',
    price: '79.99',
    priceCurrency: 'USD',
    category: 'subscription',
    url: 'https://apps.apple.com/app/id6761875106',
    availability: 'https://schema.org/InStock',
    description: 'Billed yearly through Apple, with Apple 3-day free trial. Purchased by the parent behind a birth-year gate.',
  },
  {
    '@type': 'Offer',
    name: 'Faithful Kids for Churches',
    price: '0',
    priceCurrency: 'USD',
    category: 'free',
    url: 'https://faithfulkids.app/churches',
    availability: 'https://schema.org/InStock',
    description: 'Free full accounts for churches and kids ministries. No card required.',
  },
]

const FAQS = [
  {
    q: 'How much does Faithful Kids cost?',
    a: 'On the web, $12.99 per month or $97 per year (about $8.08 per month). In the iOS app, bought through Apple, $8.99 per month or $79.99 per year. It is free for churches.',
  },
  {
    q: 'Why is the iOS price different from the web price?',
    a: 'The difference is the platform you buy on, not your region. Web plans are billed by Stripe; iOS plans are billed by Apple as in-app purchases. Both unlock the same app on every device you sign in on.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, on the annual plan: 7 days on the web, 3 days through Apple. There is no charge if you cancel during the trial. The monthly plan has no trial on either platform.',
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes. Both web plans carry a 30-day money-back guarantee: if your kids do not love it, email christian@faithfulkids.app within 30 days and you are refunded in full. iOS refunds are handled by Apple through its standard refund process.',
  },
  {
    q: 'Can my child buy anything inside the app?',
    a: 'No. There are no ads and nothing a child can buy. The subscription is purchased by the parent; in the iOS app it sits behind a birth-year parental gate.',
  },
  {
    q: 'How many kids can use one subscription?',
    a: 'Up to 5 kid profiles per family, each with its own progress, streak and level, on one plan.',
  },
  {
    q: 'Is it really free for churches?',
    a: 'Yes. Churches and kids ministries get full accounts at no cost, with no card required, through faithfulkids.app/churches.',
  },
  {
    q: 'How do I cancel?',
    a: 'Web plans: from the parent dashboard, or by emailing christian@faithfulkids.app; cancelling stops the next charge and access continues to the end of the paid period. iOS plans: Settings → your name → Subscriptions on your iPhone or iPad.',
  },
  {
    q: 'Are prices the same everywhere?',
    a: 'Web prices are in US dollars. App Store prices are set by Apple per country and may differ slightly from the US figures shown here.',
  },
]

export default function PricingPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://faithfulkids.app/#app',
    name: 'Faithful Kids',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'iOS, Web',
    url: 'https://faithfulkids.app',
    publisher: { '@type': 'Organization', '@id': 'https://faithfulkids.app/#organization', name: 'Faithful Kids' },
    offers: OFFERS,
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <SiteNav />

      <section className="blog-hero">
        <span className="section-label">Pricing</span>
        <h1>Faithful Kids pricing</h1>
        <p className="blog-hero-sub">
          Every plan, on both platforms, with both trial lengths. Stated exactly, checked {CHECKED}.
        </p>
      </section>

      <section className="stories-intro">
        <p>
          Faithful Kids costs <strong>$12.99 a month or $97 a year on the web</strong>, and{' '}
          <strong>$8.99 a month or $79.99 a year in the iOS app</strong>. The annual plan has a free
          trial: <strong>7 days on the web, 3 days through Apple</strong>. The difference between the
          two price sets is the platform you buy on — Stripe or Apple — not your region. It is{' '}
          <strong>free for churches</strong>. There are no ads and nothing a child can buy.
        </p>
      </section>

      <section className="stories-section">
        <h2>Web plans (faithfulkids.app)</h2>
        <p className="section-sub">Billed by Stripe. Works in any browser and in the iOS app once you sign in.</p>
        <div className="stories-faq">
          <div className="stories-faq-item">
            <h3>Monthly: $12.99 per month</h3>
            <p>No trial. Cancel anytime. 30-day money-back guarantee.</p>
          </div>
          <div className="stories-faq-item">
            <h3>Annual: $97 per year (about $8.08 per month)</h3>
            <p>7-day free trial — no charge if you cancel during it. Then $97 per year. Cancel anytime. 30-day money-back guarantee.</p>
          </div>
        </div>
      </section>

      <section className="stories-section">
        <h2>iOS app plans (App Store)</h2>
        <p className="section-sub">Billed by Apple as an in-app purchase. The parent buys it behind a birth-year gate; a child cannot.</p>
        <div className="stories-faq">
          <div className="stories-faq-item">
            <h3>Monthly: $8.99 per month</h3>
            <p>No trial. Managed and cancelled in your Apple subscriptions.</p>
          </div>
          <div className="stories-faq-item">
            <h3>Annual: $79.99 per year</h3>
            <p>Apple 3-day free trial, then $79.99 per year. Managed and cancelled in your Apple subscriptions.</p>
          </div>
        </div>
      </section>

      <section className="stories-section">
        <h2>Churches and kids ministries: free</h2>
        <p className="section-sub">
          Full accounts at no cost, no card required. Apply at <a href="/churches">faithfulkids.app/churches</a>.
        </p>
      </section>

      <section className="stories-section">
        <h2>What every plan includes</h2>
        <div className="stories-faq">
          <div className="stories-faq-item"><h3>310 video lessons, 31 series</h3><p>Genesis to Revelation in order, about two to three minutes each, with a quiz and a reflection question after each.</p></div>
          <div className="stories-faq-item"><h3>Up to 5 kid profiles</h3><p>Each with its own progress, streak, level and achievements.</p></div>
          <div className="stories-faq-item"><h3>PIN-protected parent dashboard</h3><p>Lessons completed, quiz scores and reflection answers, per child.</p></div>
          <div className="stories-faq-item"><h3>No ads, ever</h3><p>No ads, no social features, no chat, no external links in the child experience.</p></div>
        </div>
      </section>

      <section className="stories-section">
        <h2>Pricing questions</h2>
        <div className="stories-faq">
          {FAQS.map(f => (
            <div className="stories-faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stories-section">
        <p className="section-sub">
          Ready to start? <a href="/quiz">Start your free trial</a> on the web, or get the{' '}
          <a href="https://apps.apple.com/app/id6761875106">iOS app on the App Store</a>. Full facts about the app on the{' '}
          <a href="/about">About page</a>.
        </p>
      </section>

      <SiteFooter />
    </>
  )
}
