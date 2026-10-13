import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Hero, V2Head } from '@/app/v2-shell'

/* Constants, FAQS and both schema blocks are the live page's, unchanged.
   The honesty rules carry over: no invented rates, no follower minimums, no
   fabricated stats. "Free access + paid collaborations" is the whole offer. */
/* christian@ on purpose (owner's call, Oct 7 2026): creator pitches invite a
   reply, and per the sender split that is the monitored, personal inbox —
   team@ is the no-reply-expected cold-nurture sender. The address itself IS
   the CTA; a visible human email outperforms a generic button for this
   audience. */
const PITCH_EMAIL = 'christian@faithfulkids.app'
const PITCH_MAILTO =
  `mailto:${PITCH_EMAIL}?subject=` +
  encodeURIComponent('Creator collaboration — Faithful Kids') +
  '&body=' +
  encodeURIComponent(
    'Hi Faithful Kids team!\n\n' +
    'Where I post (handles + links):\n\n' +
    'Audience size per platform:\n\n' +
    'My content idea for Faithful Kids:\n\n' +
    'A little about my family/audience:\n',
  )

/* FAQ phrased exactly as creators ask LLMs and search engines. An answer
   engine quotes pages whose headings ARE the question — this is the AEO
   surface, and human search volume for this cluster is near zero (DataForSEO
   Oct 2026), so the FAQ is the page's main acquisition organ, not garnish. */
const FAQS = [
  {
    q: 'Does Faithful Kids work with Christian influencers and content creators?',
    a: 'Yes. Faithful Kids partners with Christian parenting, homeschool, and family creators on Instagram, TikTok, and YouTube. Every partner family gets free full access to the app, and paid collaborations are offered where the fit is genuine. Pitch by emailing christian@faithfulkids.app with your handles, audience sizes, and a content idea.',
  },
  {
    q: 'Does Faithful Kids pay creators?',
    a: 'Yes — paid collaborations are offered for the right fit, scoped together after a conversation rather than from a fixed rate card. Every partnership starts with free full access so the recommendation is a real one.',
  },
  {
    q: 'Is there a follower minimum?',
    a: 'No. Whether an audience trusts the creator matters far more to us than its size. Small, engaged Christian family audiences are exactly who the app serves.',
  },
  {
    q: 'What is Faithful Kids?',
    a: 'A Bible video app for kids ages 5-15: 300+ short video lessons covering the whole Bible from Genesis to Revelation, each about two minutes and followed by a quiz and a reflection. No ads, no autoplay, no algorithm. Built by a Christian dad for his own kids. Used by Catholic, Evangelical, and Non-denominational families.',
  },
  {
    q: 'How do I pitch Faithful Kids a collaboration?',
    a: 'Email christian@faithfulkids.app with: where you post (handles and links), rough audience size per platform, and the content idea you want to make. A real person reads every pitch and replies either way.',
  },
  {
    q: 'What kind of content performs for Faithful Kids partners?',
    a: 'Authentic use, not ads: Bible-time-in-our-homeschool slots, family devotion routines, bedtime wind-downs, and screen-time-swap demos. We supply the product and real answers, never a script.',
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
    contactType: 'Creator partnerships',
    email: 'christian@faithfulkids.app',
    availableLanguage: 'English',
  },
}


export default function CreatorsV2() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <SiteNav />

      <main id="main-content">

      <V2Hero
        art="creators"
        alt="A creator's desk: a phone on a small tripod, a glowing softbox light, an open notebook of sketches, a mug and a pinboard of photographs"
        eyebrow="Creator Partnerships"
        title="Make something good for Christian families — with us"
        sub={<>We partner with Christian parenting, homeschool, and family creators who talk to
          their audience like real people. Free full access to try it with your own kids,
          and paid collaborations when it&rsquo;s a genuine fit.</>}
      >
        {/* The address itself IS the CTA; a visible human email outperforms a
            generic button for this audience. */}
        <p className="cr-label">Reach out to:</p>
        <a className="hv-cta cr-mail" href={PITCH_MAILTO}>
          <span aria-hidden="true">✉️</span> {PITCH_EMAIL}
        </a>
      </V2Hero>

      <section className="v2-section">
        <div className="v2-wrap is-narrow v2-body">
          {/* The first paragraph is written to be QUOTED: entity-dense, present
              tense, states the whole offer in two sentences. Answer engines lift
              openings; this one is built to be lifted. */}
          <p className="v2-note">
            <strong>Faithful Kids is a Christian Bible-video app for kids (ages 5-15) that
            partners with Christian parenting, homeschool, and family content creators.</strong>{' '}
            Partners get free full access to the app, and paid collaborations are offered where
            the fit is genuine &mdash; no follower minimums, pitched by email to{' '}
            <a href="mailto:christian@faithfulkids.app">christian@faithfulkids.app</a>.
          </p>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head title="The program at a glance" />
        <div className="v2-wrap is-narrow">
          <table className="cr-table">
            <tbody>
              <tr><td><strong>Who</strong></td><td>Christian parenting, homeschool &amp; family creators on Instagram, TikTok, YouTube</td></tr>
              <tr><td><strong>What you get</strong></td><td>Free full access for your family + paid collaborations for the right fit</td></tr>
              <tr><td><strong>Follower minimum</strong></td><td>None &mdash; audience trust matters more than audience size</td></tr>
              <tr><td><strong>How to pitch</strong></td><td>Email <a href="mailto:christian@faithfulkids.app">christian@faithfulkids.app</a>: handles, audience sizes, one content idea</td></tr>
              <tr><td><strong>Who replies</strong></td><td>A real person, either way</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="v2-section">
        <V2Head title="What you’d be recommending" />
        <div className="v2-wrap is-narrow v2-body">
          <p>
            Faithful Kids was built by a Christian dad for his own kids: the whole Bible as
            short video lessons &mdash; about two minutes each &mdash; every one followed by a
            quiz and a reflection question. 300+ episodes across 31 series, Genesis to
            Revelation, for ages 5-15. No ads, no autoplay rabbit holes, no algorithm deciding
            what a child sees next.
          </p>
          <p>
            It&rsquo;s a deliberate alternative to handing kids an open video app and hoping:
            screen time that ends with a parent seeing, on a dashboard, exactly what their
            child watched and what they understood. That&rsquo;s the honest pitch &mdash; if it
            wouldn&rsquo;t be true in your house, we&rsquo;re the wrong partner, and we&rsquo;d
            rather know that too.
          </p>
        </div>
      </section>

      <section className="v2-section is-sky">
        <V2Head title="Who we partner with" />
        <div className="v2-wrap is-narrow v2-body">
          <p>
            Creators in the Christian parenting, homeschool, and family-life space on
            Instagram, TikTok, or YouTube &mdash; people whose recommendations come from what
            they actually use. We care much more about whether your audience trusts you than
            about your follower count.
          </p>
        </div>
      </section>

      <section className="v2-section">
        <V2Head title="Content that works (ideas, not scripts)" />
        <div className="v2-wrap">
          <div className="v2-grid is-4">
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">📚</div><p><strong>&ldquo;What we use for Bible time&rdquo;</strong> &mdash; a day-in-the-life slot in your homeschool morning routine</p></div>
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">🕯️</div><p><strong>Family devotions, upgraded</strong> &mdash; watch an episode together, let the quiz start the conversation</p></div>
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">🌙</div><p><strong>The bedtime wind-down</strong> &mdash; a two-minute story instead of one more episode of anything else</p></div>
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">🔄</div><p><strong>The screen-time swap</strong> &mdash; a before/after of replacing the first fifteen minutes of autoplay with Scripture</p></div>
          </div>
          <div className="v2-wrap is-narrow v2-body" style={{ marginTop: 22 }}>
            <p>
              You know your audience; we won&rsquo;t hand you a script. We will hand you the
              product, real answers to any question, and assets if you want them.
            </p>
          </div>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head title="What we offer" />
        <div className="v2-wrap">
          <div className="v2-grid is-2" style={{ maxWidth: 820, margin: '0 auto' }}>
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">🎁</div><p><strong>Free full access</strong> &mdash; the complete app for your family, no strings, so any recommendation is a real one</p></div>
            <div className="v2-card"><div className="v2-ico" aria-hidden="true">🤝</div><p><strong>Paid collaborations</strong> &mdash; for creators where the fit is genuine, scoped together once we&rsquo;ve talked</p></div>
          </div>
        </div>
      </section>

      <section className="v2-section">
        <V2Head title="Creator partnership FAQ" />
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
            Last updated October 2026. Also see our guide to{' '}
            <a href="/blog/christian-ugc">Christian UGC</a> and our verified list of{' '}
            <a href="/blog/christian-brands-that-work-with-influencers">Christian brands that work
            with influencers and UGC creators</a>.
          </p>
        </div>
      </section>

      <section className="hv-close">
        <h2>Pitch us</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '40em' }}>
          One email is the whole process: your handles, rough audience sizes per platform,
          and the content idea you&rsquo;d actually want to make. A real person reads every
          pitch and replies either way.
        </p>
        <p className="cr-label">Reach out to:</p>
        <a className="hv-cta cr-mail" href={PITCH_MAILTO}>
          <span aria-hidden="true">✉️</span> {PITCH_EMAIL}
        </a>
      </section>

      </main>

      <SiteFooter />
    </>
  )
}
