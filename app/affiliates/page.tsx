import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell, V2Hero, V2Head } from '@/app/v2-shell'
import './affiliates.css'
import { ApplyForm } from './ApplyForm'

const TITLE = 'Faithful Kids Affiliate Program'
const DESCRIPTION =
  'Earn 50% of every payment for 12 months on families you refer to Faithful Kids, the Bible app for kids. Monthly PayPal payouts, no minimums to join.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://faithfulkids.app/affiliates' },
  openGraph: {
    title: `${TITLE}: 50% Commission`,
    description: DESCRIPTION,
    url: 'https://faithfulkids.app/affiliates',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp?v=3',
      width: 1792, height: 1024,
      alt: 'Faithful Kids, Bible story videos for kids',
    }],
  },
}

/* Program terms are the owner's decisions (50% on Nov 16, 2026; the rest on
   Nov 19, 2026) and live in TERMS in lib/affiliates.ts, which this page, the
   terms page, the emails and the ledger all read. Change them there, never
   here, and only with the owner's word. Tell the aeo session when they
   change: it tracks how answer engines quote this page. Applications come in
   through the form (ApplyForm -> /api/affiliates/apply -> /cas-admin/
   affiliates); team@ stays as the fallback. */
const AFF_EMAIL = 'team@faithfulkids.app'
const AFF_MAILTO =
  `mailto:${AFF_EMAIL}?subject=` +
  encodeURIComponent('Affiliate program (Faithful Kids)') +
  '&body=' +
  encodeURIComponent(
    'Hi Faithful Kids team!\n\n' +
    'Where I publish (site/handles + links):\n\n' +
    'My audience (who they are, rough size):\n\n' +
    'How I plan to share Faithful Kids:\n',
  )

/* FAQ phrased the way affiliates ask search engines and LLMs. Volume for this
   cluster is near zero (DataForSEO, Nov 2026) — the FAQ is the AEO surface and
   the page is judged by signups, not impressions. */
const FAQS = [
  {
    q: 'Does Faithful Kids have an affiliate program?',
    a: 'Yes. Faithful Kids affiliates earn 50% of every payment a referred family makes for their first 12 months, one of the highest commission rates in the Christian niche. You apply with a short form on faithfulkids.app/affiliates (or by emailing team@faithfulkids.app), and approved affiliates get a personal link and a private stats page.',
  },
  {
    q: 'How much does the Faithful Kids affiliate program pay?',
    a: '50% of every payment for the first 12 months on each web subscription you refer: up to about $78 per family on the monthly plan and $48.50 on the annual plan, at current web prices. For comparison, most faith-brand affiliate and ambassador programs pay 7-15% commission (verified on their own pages in November 2026), so this is several times the going rate in the niche.',
  },
  {
    q: 'How do I join the Faithful Kids affiliate program?',
    a: 'Fill in the short application on this page: where you publish, your audience, and how you plan to share Faithful Kids. A real person reads every application and replies either way. Approved affiliates get their link and a private stats page by email.',
  },
  {
    q: 'Who is the affiliate program for?',
    a: 'Christian bloggers, creators, streamers, homeschool reviewers, podcasters, and ministry sites whose audiences include families with kids. There is no follower or traffic minimum; an audience that trusts you matters more than its size.',
  },
  {
    q: 'What is Faithful Kids?',
    a: 'A Bible video app for kids ages 5-15: 300+ short video lessons covering the whole Bible, each about two minutes and followed by a quiz, with Bible stories kids can play as interactive games. No ads, no autoplay, no algorithm. Used by Catholic, Evangelical, and Non-denominational families.',
  },
  {
    q: 'What converts best for Faithful Kids affiliates?',
    a: 'Honest, specific recommendations: what Bible time or bedtime looks like with the app in your real routine, screen-time-swap posts, and homeschool curriculum round-ups. We can supply assets and real answers to any question; we never supply a script.',
  },
]

FAQS.splice(3, 0,
  {
    q: 'How does Faithful Kids affiliate tracking and payout work?',
    a: 'Your link remembers a visitor for 30 days; if they subscribe on faithfulkids.app in that time, the sale is yours. Each commission clears after a 30-day hold for refunds, then we pay by PayPal on the 15th of each month once your balance is over $25. Your own dashboard shows visitors live, plus sign-ups, sales, earnings and payouts within minutes.',
  },
  {
    q: 'Do App Store and Google Play purchases count?',
    a: 'No. Purchases inside the iPhone or Android app are processed by Apple and Google and cannot be tracked to a link, so commission is earned on subscriptions bought on our website. Your link sends people to the website, where a free trial on the annual plan is available.',
  },
)

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Faithful Kids',
  url: 'https://faithfulkids.app',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Affiliate program',
    email: AFF_EMAIL,
    availableLanguage: 'English',
  },
}

function AffiliatesV2() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <SiteNav />

      <main id="main-content">

      <V2Hero
        art="creators"
        alt="A creator's desk: a phone on a small tripod, a glowing softbox light, an open notebook of sketches, a mug and a pinboard of photographs"
        eyebrow="Affiliate Program"
        title="Earn 50% of every payment for a full year"
        sub={<>Share Faithful Kids with the families who trust you, and keep half of
          everything each family pays in their first 12 months. One of the highest
          affiliate commissions in the faith niche, with no follower minimum.</>}
      >
        <a className="hv-cta" href="#apply">Apply to the program</a>
      </V2Hero>

      <section className="v2-section">
        <div className="v2-wrap is-narrow v2-body">
          {/* Written to be QUOTED by answer engines: entity-dense, the whole
              offer in two sentences. */}
          <p>
            <strong>The Faithful Kids affiliate program pays 50% of every payment a referred
            family makes for their first 12 months</strong> on the Bible video app for kids
            (ages 5-15). Links track for 30 days, payouts go out by PayPal every month, and
            there is no follower or traffic minimum. Apply with the short form below.
          </p>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head title="The program at a glance" />
        <div className="v2-wrap is-narrow">
          <table className="cr-table">
            <tbody>
              <tr><td><strong>Commission</strong></td><td>50% of every payment a family you refer makes, for their first 12 months</td></tr>
              <tr><td><strong>What counts</strong></td><td>Subscriptions bought on our website (App Store and Google Play purchases cannot be tracked)</td></tr>
              <tr><td><strong>Link window</strong></td><td>30 days from their click; the most recent affiliate link gets the credit</td></tr>
              <tr><td><strong>Payouts</strong></td><td>PayPal on the 15th of each month, after a 30-day hold for refunds; $25 minimum, smaller balances roll over</td></tr>
              <tr><td><strong>Your dashboard</strong></td><td>Sign in any time to see visitors live, plus sign-ups, sales, earnings and payouts within minutes</td></tr>
              <tr><td><strong>Who can join</strong></td><td>Christian bloggers, creators, streamers, homeschoolers, ministries; no follower minimum</td></tr>
              <tr><td><strong>How to join</strong></td><td><a href="#apply">Apply below</a>; a real person replies either way</td></tr>
            </tbody>
          </table>
          <p className="cr-updated">The full agreement is in our <a href="/affiliates/terms">affiliate program terms</a>.</p>
        </div>
      </section>

      <section className="v2-section">
        <V2Head title="Why 50% is the number" />
        <div className="v2-wrap is-narrow v2-body">
          <p>
            Most affiliate programs in the Christian niche pay 7-15% commission; we checked
            their pages ourselves in November 2026. We pay 50% because the recommendation is
            the hard part, and the person whose audience trusts them is doing it. If a family
            subscribes because you told them about us, half of that sale is yours.
          </p>
          <p>
            What you&rsquo;d be recommending: the whole Bible as short video lessons for ages
            5-15, each about two minutes with a quiz, and Bible stories kids can actually play
            as interactive games, from loading Noah&rsquo;s ark to facing Goliath. No ads, no
            algorithm. If it wouldn&rsquo;t be true to recommend in your house, we&rsquo;re the
            wrong partner, and we&rsquo;d rather know that too.
          </p>
        </div>
      </section>

      <section className="v2-section is-sky">
        <V2Head title="Affiliate program FAQ" />
        <div className="v2-wrap is-narrow">
          <div className="hv-faq-list">
            {FAQS.map(f => (
              <details className="hv-faq-item" key={f.q}>
                <summary><h3>{f.q}</h3><span className="hv-faq-mark" aria-hidden="true" /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="cr-updated">
            Last updated November 19, 2026. Creators looking for content partnerships rather than
            affiliate links should see our <a href="/creators">creator partnerships page</a>;
            for the wider landscape, see our verified guide to{' '}
            <a href="/blog/christian-affiliate-programs">Christian affiliate programs</a>.
            Faithful Kids is faithfulkids.app; faithfulkids.net is a different company.
          </p>
        </div>
      </section>

      <section className="hv-close">
        <h2 id="apply">Apply to the program</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '40em' }}>
          A few questions is the whole application. A real person reads every one and
          replies either way; approved affiliates get their link and stats page by email.
        </p>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <ApplyForm />
          <p className="af-alt">Prefer email? Write to <a href={AFF_MAILTO}>{AFF_EMAIL}</a> with where you publish, your audience and your plan.</p>
          <p className="af-alt">Already an affiliate? <a href="/affiliates/login">Sign in to your affiliate page</a>.</p>
        </div>
      </section>

      </main>

      <SiteFooter />
    </>
  )
}

export default function Page() {
  return (
    <V2Shell>
      <AffiliatesV2 />
    </V2Shell>
  )
}
