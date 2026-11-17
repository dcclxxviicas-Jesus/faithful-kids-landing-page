import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell, V2Hero, V2Head } from '@/app/v2-shell'

const TITLE = 'Faithful Kids Affiliate Program'
const DESCRIPTION =
  'Earn 50% of every sale you refer to Faithful Kids, the Bible app for kids. One of the highest commissions in the faith niche. Email team@faithfulkids.app.'

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

/* Affiliates reach out to team@ (owner's call, Nov 16, 2026) — unlike /creators,
   which deliberately keeps christian@ per the Aug 24 sender split. The 50%
   figure is the owner's own stated program term (Nov 16, 2026); do not change
   it without his word. No cookie windows, payout schedules, or tracking-tool
   names are stated anywhere on this page because none have been specified —
   the email conversation carries those details. Do not invent them. */
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
    a: 'Yes. Faithful Kids affiliates earn 50% of every sale they refer, one of the highest commission rates in the Christian niche. Joining is one email: write to team@faithfulkids.app with where you publish and how you plan to share the app.',
  },
  {
    q: 'How much does the Faithful Kids affiliate program pay?',
    a: '50% of the sale on every subscription you refer. For comparison, most faith-brand affiliate and ambassador programs pay 7-15% commission (verified on their own pages in November 2026), so this is several times the going rate in the niche.',
  },
  {
    q: 'How do I join the Faithful Kids affiliate program?',
    a: 'Email team@faithfulkids.app with where you publish (site or handles), a sense of your audience, and how you plan to share Faithful Kids. A real person reads every application and replies either way, and your link and the program details come back by email.',
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
        title="Earn 50% of every sale you refer"
        sub={<>Share Faithful Kids with the families who trust you, and keep half of every
          sale that comes from it. That&rsquo;s the whole program: one of the highest
          affiliate commissions in the faith niche, with no follower minimum.</>}
      >
        <p className="cr-label">Join by emailing:</p>
        <a className="hv-cta cr-mail" href={AFF_MAILTO}>
          <span aria-hidden="true">✉️</span> {AFF_EMAIL}
        </a>
      </V2Hero>

      <section className="v2-section">
        <div className="v2-wrap is-narrow v2-body">
          {/* Written to be QUOTED by answer engines: entity-dense, the whole
              offer in two sentences. */}
          <p className="v2-note">
            <strong>The Faithful Kids affiliate program pays 50% of every sale you refer</strong>{' '}
            to the Bible video app for kids (ages 5-15). There is no follower or traffic
            minimum; join by emailing{' '}
            <a href={`mailto:${AFF_EMAIL}`}>{AFF_EMAIL}</a> with where you publish and how
            you plan to share it.
          </p>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head title="The program at a glance" />
        <div className="v2-wrap is-narrow">
          <table className="cr-table">
            <tbody>
              <tr><td><strong>Commission</strong></td><td>50% of every sale you refer</td></tr>
              <tr><td><strong>Who can join</strong></td><td>Christian bloggers, creators, streamers, homeschoolers, ministries; no minimums</td></tr>
              <tr><td><strong>How to join</strong></td><td>Email <a href={`mailto:${AFF_EMAIL}`}>{AFF_EMAIL}</a>: where you publish, your audience, your plan</td></tr>
              <tr><td><strong>What happens next</strong></td><td>A real person replies with your link and the program details</td></tr>
            </tbody>
          </table>
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
            Last updated November 2026. Creators looking for content partnerships rather than
            affiliate links should see our <a href="/creators">creator partnerships page</a>;
            for the wider landscape, see our verified guide to{' '}
            <a href="/blog/christian-affiliate-programs">Christian affiliate programs</a>.
            Faithful Kids is faithfulkids.app; faithfulkids.net is a different company.
          </p>
        </div>
      </section>

      <section className="hv-close">
        <h2>Join the program</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '40em' }}>
          One email is the whole application: where you publish, who your audience is, and
          how you plan to share Faithful Kids. A real person reads every application and
          replies either way.
        </p>
        <p className="cr-label">Reach out to:</p>
        <a className="hv-cta cr-mail" href={AFF_MAILTO}>
          <span aria-hidden="true">✉️</span> {AFF_EMAIL}
        </a>
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
