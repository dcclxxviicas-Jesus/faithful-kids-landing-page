import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Hero, V2Head } from '@/app/v2-shell'

/* OFFERS, FAQS and both schema blocks are the live page's, unchanged. Web and
   Apple prices are deliberately different and are never "aligned". */
const CHECKED = 'September 21, 2026'
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


export default function PricingV2() {
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

      <main id="main-content">

      <V2Hero
        short
        art="pricing"
        alt="A cosy living-room corner at evening: an armchair with a folded blanket, a tablet glowing on a cushion, a basket of picture books and a sleeping cat"
        eyebrow="Pricing"
        title={<>Faithful Kids <span className="hv-love"><span className="l l1">p</span><span className="l l2">r</span><span className="l l3">i</span><span className="l l4">c</span><span className="l l1">i</span><span className="l l2">n</span><span className="l l3">g</span></span></>}
        sub={<>Every plan, on both platforms, with both trial lengths. Stated exactly,
          checked {CHECKED}.</>}
      />

      <section className="v2-section">
        <div className="v2-wrap is-narrow v2-body">
          <p className="v2-note">
            Faithful Kids costs <strong>$12.99 a month or $97 a year on the web</strong>, and{' '}
            <strong>$8.99 a month or $79.99 a year in the iOS app</strong>. The annual plan has a free
            trial: <strong>7 days on the web, 3 days through Apple</strong>. The difference between the
            two price sets is the platform you buy on &mdash; Stripe or Apple &mdash; not your region. It is{' '}
            <strong>free for churches</strong>. There are no ads and nothing a child can buy.
          </p>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head title="Web plans (faithfulkids.app)"
                sub="Billed by Stripe. Works in any browser and in the iOS app once you sign in." />
        <div className="v2-wrap">
          <div className="v2-grid is-2" style={{ maxWidth: 820, margin: '0 auto' }}>
            <div className="pr-plan">
              <h3 className="pr-head">Monthly: <span className="pr-amt">$12.99</span> per month</h3>
              <p>No trial. Cancel anytime. 30-day money-back guarantee.</p>
            </div>
            <div className="pr-plan is-best">
              <span className="hv-tag">7-day free trial</span>
              <h3 className="pr-head">Annual: <span className="pr-amt">$97</span> per year (about $8.08 per month)</h3>
              <p>7-day free trial &mdash; no charge if you cancel during it. Then $97 per year. Cancel anytime. 30-day money-back guarantee.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-section">
        <V2Head title="iOS app plans (App Store)"
                sub="Billed by Apple as an in-app purchase. The parent buys it behind a birth-year gate; a child cannot." />
        <div className="v2-wrap">
          <div className="v2-grid is-2" style={{ maxWidth: 820, margin: '0 auto' }}>
            <div className="pr-plan">
              <h3 className="pr-head">Monthly: <span className="pr-amt">$8.99</span> per month</h3>
              <p>No trial. Managed and cancelled in your Apple subscriptions.</p>
            </div>
            <div className="pr-plan">
              <span className="hv-tag is-apple">Apple 3-day trial</span>
              <h3 className="pr-head">Annual: <span className="pr-amt">$79.99</span> per year</h3>
              <p>Apple 3-day free trial, then $79.99 per year. Managed and cancelled in your Apple subscriptions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-section is-sky">
        <V2Head title="Churches and kids ministries: free"
                sub={<>Full accounts at no cost, no card required. Apply at{' '}
                  <a href="/churches">faithfulkids.app/churches</a>.</>} />
      </section>

      <section className="v2-section">
        <V2Head title="What every plan includes" />
        <div className="v2-wrap">
          <div className="v2-grid is-4">
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">📺</div><h3>310 video lessons, 31 series</h3><p>Genesis to Revelation in order, about two to three minutes each, with a quiz and a reflection question after each.</p></div>
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">👨‍👩‍👧‍👦</div><h3>Up to 5 kid profiles</h3><p>Each with its own progress, streak, level and achievements.</p></div>
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">🔒</div><h3>PIN-protected parent dashboard</h3><p>Lessons completed, quiz scores and reflection answers, per child.</p></div>
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">🚫</div><h3>No ads, ever</h3><p>No ads, no social features, no chat, no external links in the child experience.</p></div>
          </div>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head title="Pricing questions" />
        <div className="v2-wrap is-narrow">
          <div className="hv-faq-list">
            {FAQS.map(f => (
              <details className="hv-faq-item" key={f.q}>
                <summary><h3>{f.q}</h3><span className="hv-faq-mark" aria-hidden="true" /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">🎁</span>7 days free on annual</li>
          <li><span aria-hidden="true">💸</span>30-day money-back</li>
          <li><span aria-hidden="true">⛪</span>Free for churches</li>
        </ul>
        <h2>Ready to start?</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '40em' }}>
          <a href="/quiz">Start your free trial</a> on the web, or get the{' '}
          <a href="https://apps.apple.com/app/id6761875106">iOS app on the App Store</a>. Full facts about the app on the{' '}
          <a href="/about">About page</a>.
        </p>
        <a className="hv-cta" href="/quiz">
          <span className="hv-cta-play" aria-hidden="true" />
          Start your free trial
        </a>
      </section>

      </main>

      <SiteFooter />
    </>
  )
}
