import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'

/**
 * /creators — the inbound door for Christian family / homeschool / parenting
 * creators. Built after a warm unsolicited paid-UGC pitch arrived (Oct 2026):
 * the roster outreach in creator-outreach/ pushes outward; this page is the
 * magnet that lets the next pitch come to us.
 *
 * Deliberately INDEXED (creators search for "brands that work with Christian
 * creators"), footer-linked, in the sitemap. /partnerships redirects here.
 *
 * Honesty rules, same as every page: no invented rates, no follower minimums,
 * no fabricated stats or testimonials. "Free access + paid collaborations" is
 * the whole offer until the owner sets numbers. Every product claim is ground
 * truth from check-counts.py (300+ lessons, 31 series, about two minutes,
 * ages 5-15) and the origin line matches /about ("a dad who built it for his
 * own kids").
 */

const TITLE = 'Partner With Faithful Kids'
const DESCRIPTION =
  'Faithful Kids partners with Christian parenting, homeschool, and family creators — free full access to review, and paid collaborations for the right fit.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://faithfulkids.app/creators' },
  openGraph: {
    title: `${TITLE} — Creator Collaborations`,
    description: DESCRIPTION,
    url: 'https://faithfulkids.app/creators',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{
      url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp',
      width: 1792, height: 1024,
      alt: 'Faithful Kids — Bible story videos for kids',
    }],
  },
}

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

export default function CreatorsPage() {
  return (
    <>
      <SiteNav />

      <section className="blog-hero">
        <span className="section-label">Creator Partnerships</span>
        <h1>Make something good for Christian families — with us</h1>
        <p className="blog-hero-sub">
          We partner with Christian parenting, homeschool, and family creators who talk to
          their audience like real people. Free full access to try it with your own kids,
          and paid collaborations when it&rsquo;s a genuine fit.
        </p>
        <div className="creator-mail-wrap">
          <span className="creator-mail-label">Reach out to:</span>
          <a className="creator-mail" href={PITCH_MAILTO}>
            <span aria-hidden="true">✉️</span> {PITCH_EMAIL}
          </a>
        </div>
      </section>

      <section className="cp-intro">
        <h2>What you&rsquo;d be recommending</h2>
        <p>
          Faithful Kids was built by a Christian dad for his own kids: the whole Bible as
          short video lessons — about two minutes each — every one followed by a quiz and a
          reflection question. 300+ episodes across 31 series, Genesis to Revelation, for
          ages 5-15. No ads, no autoplay rabbit holes, no algorithm deciding what a child
          sees next.
        </p>
        <p>
          It&rsquo;s a deliberate alternative to handing kids an open video app and hoping:
          screen time that ends with a parent seeing, on a dashboard, exactly what their
          child watched and what they understood. That&rsquo;s the honest pitch — if it
          wouldn&rsquo;t be true in your house, we&rsquo;re the wrong partner, and we&rsquo;d
          rather know that too.
        </p>

        <h2>Who we partner with</h2>
        <p>
          Creators in the Christian parenting, homeschool, and family-life space on
          Instagram, TikTok, or YouTube — people whose recommendations come from what they
          actually use. We care much more about whether your audience trusts you than about
          your follower count.
        </p>

        <h2>Content that works (ideas, not scripts)</h2>
        <ul>
          <li><strong>&ldquo;What we use for Bible time&rdquo;</strong> — a day-in-the-life slot in your homeschool morning routine</li>
          <li><strong>Family devotions, upgraded</strong> — watch an episode together, let the quiz start the conversation</li>
          <li><strong>The bedtime wind-down</strong> — a two-minute story instead of one more episode of anything else</li>
          <li><strong>The screen-time swap</strong> — a before/after of replacing the first fifteen minutes of autoplay with Scripture</li>
        </ul>
        <p>
          You know your audience; we won&rsquo;t hand you a script. We will hand you the
          product, real answers to any question, and assets if you want them.
        </p>

        <h2>What we offer</h2>
        <ul>
          <li><strong>Free full access</strong> — the complete app for your family, no strings, so any recommendation is a real one</li>
          <li><strong>Paid collaborations</strong> — for creators where the fit is genuine, scoped together once we&rsquo;ve talked</li>
        </ul>
      </section>

      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>Pitch us</h2>
          <p>
            One email is the whole process: your handles, rough audience sizes per platform,
            and the content idea you&rsquo;d actually want to make. A real person reads every
            pitch and replies either way.
          </p>
          <div className="creator-mail-wrap">
            <span className="creator-mail-label">Reach out to:</span>
            <a className="creator-mail creator-mail-big" href={PITCH_MAILTO}>
              <span aria-hidden="true">✉️</span> {PITCH_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
