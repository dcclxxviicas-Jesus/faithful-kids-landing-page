import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell, V2Hero, V2Head } from '@/app/v2-shell'

/*
 * /press: who to contact for press and media (owner request, Nov 17, 2026).
 *
 * Every fact here is ground truth from check-counts.py / CLAUDE.md: 300+
 * lessons, about two minutes each, 31 series, ages 5-15, web + App Store
 * (live Sep 1, 2026) + Google Play (live Oct 30, 2026). No prices on purpose:
 * they differ by platform and change.
 *
 * The page offers WRITTEN answers, not interviews or podcast spots: the owner
 * declined podcast appearances (Aug 23, 2026). Do not add "available for
 * interviews" without asking him.
 */

const EMAIL = 'team@faithfulkids.app'
const MAILTO = `mailto:${EMAIL}?subject=` + encodeURIComponent('Press inquiry') + '&body=' +
  encodeURIComponent('Hi Faithful Kids team,\n\nPublication:\n\nWhat I am working on:\n\nMy deadline:\n\nQuestions:\n')

const TITLE = 'Press and Media'
const DESCRIPTION = 'Press and media inquiries for Faithful Kids, the Bible video app for kids ages 5 to 15. Contact, company facts, research and logos.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://faithfulkids.app/press' },
  openGraph: {
    title: 'Faithful Kids: Press and Media',
    description: DESCRIPTION,
    url: 'https://faithfulkids.app/press',
    siteName: 'Faithful Kids',
    type: 'website',
    images: [{ url: 'https://d3g07v1w0lehiv.cloudfront.net/blog-images/david-and-goliath-for-kids-hero.webp?v=3', width: 1792, height: 1024, alt: 'Faithful Kids, Bible story videos for kids' }],
  },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Faithful Kids',
  url: 'https://faithfulkids.app',
  logo: 'https://faithfulkids.app/logo-512.png',
  founder: { '@type': 'Person', name: 'Christian Alexander', url: 'https://faithfulkids.app/about/christian-alexander' },
  contactPoint: { '@type': 'ContactPoint', contactType: 'Press', email: EMAIL, availableLanguage: 'English' },
}

function PressV2() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <SiteNav />
      <main id="main-content">
        <V2Hero
          art="about"
          alt="An illustrator's worktable with pencil sketches of Bible scenes pinned to a board, a paint palette, brushes in a jar and a mug of tea"
          eyebrow="Press"
          title="Press and media inquiries"
          sub={<>Writing about kids, faith and screens? We&rsquo;re glad to help with facts,
            data from our research, and written answers to your questions.</>}
        >
          <p className="cr-label">Email us at:</p>
          <a className="hv-cta cr-mail" href={MAILTO}>
            <span aria-hidden="true">✉️</span> {EMAIL}
          </a>
        </V2Hero>

        <section className="v2-section">
          <V2Head title="About Faithful Kids" />
          <div className="v2-wrap is-narrow v2-body">
            {/* Boilerplate written to be quoted as-is. */}
            <p className="v2-note">
              <strong>Faithful Kids is a Bible video app for kids ages 5 to 15.</strong> It
              walks children through the whole Bible in order in 300+ short animated video
              lessons, each about two minutes and followed by a quiz, across 31 series from
              Genesis to Revelation. There are no ads, no autoplay and no algorithm. It works
              on the web, iPhone, iPad and Android, and is used by Catholic, Evangelical and
              non-denominational families.
            </p>
            <p>
              Please write the name as two words, <strong>Faithful Kids</strong>, and link to
              faithfulkids.app. (faithfulkids.net is a different company.)
            </p>
          </div>
        </section>

        <section className="v2-section is-alt">
          <V2Head title="Fast facts" />
          <div className="v2-wrap is-narrow">
            <table className="cr-table">
              <tbody>
                <tr><td><strong>What it is</strong></td><td>A Bible video app for kids, with a quiz after every lesson</td></tr>
                <tr><td><strong>Ages</strong></td><td>5 to 15</td></tr>
                <tr><td><strong>Lessons</strong></td><td>300+ animated lessons, about two minutes each, in 31 series</td></tr>
                <tr><td><strong>Where</strong></td><td>Web (<a href="https://faithfulkids.app">faithfulkids.app</a>), the <a href="https://apps.apple.com/app/id6761875106">App Store</a> (since September 2026) and <a href="https://play.google.com/store/apps/details?id=app.faithfulkids.app">Google Play</a> (since October 2026)</td></tr>
                <tr><td><strong>Founder</strong></td><td><a href="/about/christian-alexander">Christian Alexander</a></td></tr>
                <tr><td><strong>Statement of faith</strong></td><td><a href="/beliefs">faithfulkids.app/beliefs</a></td></tr>
                <tr><td><strong>Press contact</strong></td><td><a href={MAILTO}>{EMAIL}</a></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="v2-section">
          <V2Head title="Research and data" />
          <div className="v2-wrap is-narrow v2-body">
            <p>
              We publish original studies from our own data, with sample sizes and methods on
              every page, free to cite with a link. Start with our{' '}
              <a href="/research/bible-literacy">Bible literacy study</a>, built from how
              players answered our children&rsquo;s Bible quiz, or browse every study on
              the <a href="/research">research page</a>. If you need a figure we haven&rsquo;t
              published, ask; we&rsquo;ll tell you whether our data can answer it honestly.
            </p>
            <p>
              Our founder has written for <a href="https://www.christianpost.com/voices/i-took-my-kids-screens-away-heres-why-it-didnt-work.html" target="_blank" rel="noopener">The Christian Post</a>{' '}
              on screens and faith at home, and our <a href="/parenting">Raising Faithful Kids</a>{' '}
              section publishes essays from Christian parents and educators.
            </p>
          </div>
        </section>

        <section className="v2-section is-alt">
          <V2Head title="Logos" />
          <div className="v2-wrap is-narrow v2-body">
            <p>
              You&rsquo;re welcome to use our logo in coverage of Faithful Kids. Please don&rsquo;t
              alter it.
            </p>
            <ul style={{ paddingLeft: '1.3rem', margin: '0 0 1rem' }}>
              <li><a href="/logo.png" download>Faithful Kids logo (PNG)</a></li>
              <li><a href="/logo-512.png" download>App icon, 512 by 512 (PNG)</a></li>
            </ul>
            <p>Need screenshots or lesson stills? Email us and say what size you need.</p>
          </div>
        </section>

        <section className="hv-close">
          <h2>Get in touch</h2>
          <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '40em' }}>
            Tell us your publication, your deadline and your questions. A real person reads
            every press email, and written questions are the quickest way to a full answer.
          </p>
          <a className="hv-cta cr-mail" href={MAILTO}>
            <span aria-hidden="true">✉️</span> {EMAIL}
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
      <PressV2 />
    </V2Shell>
  )
}
