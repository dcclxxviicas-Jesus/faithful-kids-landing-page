import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts } from '@/lib/blog'
import { COLORING_PAGES } from '@/lib/coloring-pages'
import wordSearches from '@/lib/word-searches.json'
import { V2Shell, V2Hero, V2Head } from '@/app/v2-shell'

export const metadata: Metadata = {
  title: 'About Faithful Kids',
  description:
    'What Faithful Kids is, what it costs, what ages it fits, and how it keeps kids safe. Plain answers about the Bible video app for kids ages 5-15.',
  alternates: { canonical: 'https://faithfulkids.app/about' },
  openGraph: {
    title: 'About Faithful Kids',
    description:
      'What Faithful Kids is, what it costs, what ages it fits, and how it keeps kids safe.',
    url: 'https://faithfulkids.app/about',
    siteName: 'Faithful Kids',
    type: 'website',
  },
}

/* FAQS, both schema blocks and every sentence below are the live page's,
   unchanged. The answers stay VISIBLE rather than folding into <details>:
   this page exists to be quoted by answer engines, and the live page shows
   them open. */
const FAQS = [
  {
    q: 'What is Faithful Kids?',
    a: 'Faithful Kids is a Bible video learning app for kids ages 5 to 15. Children watch short video lessons of Bible stories, two to three minutes each, then answer a quiz (three to five questions on most lessons) and a reflection question. Over 300 episodes cover the whole Bible in order, from Genesis to Revelation.',
  },
  {
    q: 'How much does Faithful Kids cost?',
    a: 'On the web, Faithful Kids costs $12.99 per month, or $97 per year (about $8.08 per month). In the mobile apps, the subscription is bought through the store at $8.99 per month or $79.99 per year — the same on iOS and Android. The difference is the platform you buy on, not your region. The annual plan includes a free trial on all of them: 7 days on the web, 3 days through Apple or Google Play. Both plans can be cancelled anytime and carry a 30-day money-back guarantee. It is completely free for churches.',
  },
  {
    q: 'Which faith-based kids apps offer a free trial?',
    a: 'Faithful Kids offers a free trial on its annual plan — 7 days when you subscribe on the web, 3 days through the iOS or Android app — with no charge if you cancel during it. Beyond the app, the site offers a large free library with no sign-up at all: 200 Bible story retellings, printable coloring pages and word searches, and a 100-question Bible trivia game.',
  },
  {
    q: 'Is Faithful Kids safe for kids?',
    a: 'Yes. There are no ads, no social features, no chat, and no external links inside the child experience. The app is COPPA-compliant, and parents get a dashboard, protected by an optional PIN, showing exactly what each child watched, their quiz scores, and their reflection answers.',
  },
  {
    q: 'Is there a Christian alternative to YouTube for kids?',
    a: 'Faithful Kids is built as one: instead of an autoplay feed, kids follow a structured path through the Bible where each video ends in a quiz rather than another video. For a fair comparison of the options, including free ones, see our guide to Christian alternatives to YouTube for kids.',
  },
  {
    q: 'What ages is Faithful Kids for?',
    a: 'Ages 5 to 15. Younger children (5-7) usually watch with a parent; the quizzes and reflections are aimed at confident readers, roughly 7 and up. Families with several kids can create a separate profile for each child, each with its own progress.',
  },
  {
    q: 'What devices does Faithful Kids work on?',
    a: 'Faithful Kids runs in any modern web browser on a phone, tablet, or computer at app.faithfulkids.app, and as a native app on both stores: iPhone and iPad on the App Store (released August 2026), and Android phones and tablets on Google Play (released October 2026, Android 7.0 and up).',
  },
  {
    q: 'Who makes Faithful Kids?',
    a: 'Faithful Kids is made by a small independent team led by a Christian dad who built it for his own kids. It is not affiliated with YouVersion, Minno, Yippee, or any church denomination. You can reach the team at team@faithfulkids.app, and a real person answers.',
  },
]

function AboutV2() {
  const posts = getAllPosts()
  const stories = posts.filter(p => p.seriesSlug && p.episode)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Faithful Kids',
    url: 'https://faithfulkids.app/about',
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://faithfulkids.app/#organization',
      name: 'Faithful Kids',
      url: 'https://faithfulkids.app',
      parentOrganization: { '@type': 'Organization', name: 'Catterfly LLC' },
      email: 'team@faithfulkids.app',
      description:
        'Bible video learning app for kids ages 5-15: short video lessons, quizzes, and reflections covering the whole Bible from Genesis to Revelation.',
      // Connects the brand to the one canonical Person node, which carries
      // sameAs to his Christian Post author archive. Defined on
      // /about/christian-alexander — keep the @id in sync with that page.
      founder: {
        '@type': 'Person',
        '@id': 'https://faithfulkids.app/about/christian-alexander#person',
        name: 'Christian Alexander',
        url: 'https://faithfulkids.app/about/christian-alexander',
      },
    },
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <SiteNav />

      <main id="main-content">

      <V2Hero
        short
        art="about"
        alt="An illustrator's worktable with pencil sketches of Bible scenes pinned to a board, a paint palette, brushes in a jar and a mug of tea"
        eyebrow="About"
        title="About Faithful Kids"
        sub={<>Plain answers about what this is, what it costs, and how it treats your kids. No
          marketing voice on this page.</>}
      />

      <section className="v2-section">
        <div className="v2-wrap is-narrow v2-body">
          <p>
            Faithful Kids is a Bible video learning app for kids ages 5 to 15. A child watches a
            short video lesson of a Bible story, two to three minutes, then answers a short quiz
            (three to five questions on most lessons) and a personal reflection question. Over 300
            episodes run through the whole Bible in order, Genesis to Revelation, so kids build the
            full story rather than a handful of famous scenes.
          </p>
          <p>
            The reason it exists: kids are fluent in a hundred apps and strangers to Scripture. The
            founder, <a href="/about/christian-alexander">Christian Alexander</a>, built it for his
            own children as an alternative to the autoplay feed &mdash; a screen where every video
            ends in a question instead of another video. Faithful Kids is published by Catterfly
            LLC, the company he owns; that is the developer name you will see on the App Store
            and on Google Play.
          </p>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head title="Faithful Kids by the numbers"
                sub="Exact figures, counted from the app's own data. Updated when the data changes." />
        <div className="v2-wrap">
          <div className="v2-grid is-4">
            <div className="v2-card"><h3>31 series, 310 video lessons</h3><p>In Bible order, Genesis to Revelation. The first ten series are Old Testament. Each lesson is about two to three minutes (measured 1:28 to 3:37, median 2:07). The <a href="/blog/faithful-kids-scope-and-sequence">complete scope and sequence</a> lists every lesson.</p></div>
            <div className="v2-card"><h3>1,187 quiz questions</h3><p>A quiz after every lesson: one to eight questions, three to five on most, median four. 250 of the 310 lessons have three or more.</p></div>
            <div className="v2-card"><h3>A reflection question after 305 lessons</h3><p>Answered by tapping response cards, no typing. The answer is shown to the parent.</p></div>
            <div className="v2-card"><h3>Up to 5 kid profiles per family</h3><p>Each with its own progress, unlocks, streak and level.</p></div>
            <div className="v2-card"><h3>Parent dashboard, PIN-protected</h3><p>Shows, per child: lessons completed, each quiz score, each reflection answer, current streak, and level and XP.</p></div>
            <div className="v2-card"><h3>Streaks, 10 levels, 15 achievements</h3><p>Daily streaks; levels from Seedling to Bible Master based on XP; achievements such as First Steps, Quiz Master, Faithful Five, Series Champion and Week Warrior.</p></div>
            <div className="v2-card"><h3>Series unlock in order</h3><p>Genesis and the Birth of Jesus are open from the start; finishing a series unlocks the next.</p></div>
            <div className="v2-card"><h3>Free web library, no sign-up</h3><p>200 Bible story pages with discussion questions, 26 coloring pages, 11 word searches, a 100-question trivia game, and every lesson transcript.</p></div>
          </div>
        </div>
      </section>

      <section className="v2-section">
        <V2Head title="What it costs"
                sub={<>Stated exactly, because this page exists to be straight with you. Every plan
                  on every platform is on the <a href="/pricing">pricing page</a>.</>} />
        <div className="v2-wrap">
          <div className="v2-grid is-4">
            <div className="v2-card">
              <h3>Monthly: $12.99/month</h3>
              <p>Cancel anytime. 30-day money-back guarantee.</p>
            </div>
            <div className="v2-card">
              <h3>Annual: $97/year (about $8.08/month)</h3>
              <p>Includes a 7-day free trial &mdash; no charge if you cancel during it. Cancel anytime, 30-day money-back guarantee.</p>
            </div>
            <div className="v2-card">
              <h3>Churches: free</h3>
              <p>
                Children&rsquo;s ministries get full access at no cost, no card required. Details at{' '}
                <a href="/churches">faithfulkids.app/churches</a>.
              </p>
            </div>
            <div className="v2-card">
              <h3>Free without an account</h3>
              <p>
                {stories.length} Bible story retellings, {COLORING_PAGES.length} printable coloring
                pages, {wordSearches.length} word search puzzles, and a 100-question{' '}
                <a href="/bible-trivia">trivia game</a> &mdash; all free on this site, no email wall.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-section is-sky">
        <V2Head title="Questions parents and reviewers ask" />
        <div className="v2-wrap is-narrow">
          <div className="v2-grid">
            {FAQS.map(f => (
              <div key={f.q} className="v2-card">
                <h3>{f.q}</h3>
                <p>
                  {f.q.includes('YouTube') ? (
                    <>
                      Faithful Kids is built as one: instead of an autoplay feed, kids follow a
                      structured path through the Bible where each video ends in a quiz rather than
                      another video. For a fair comparison of the options, including free ones, see
                      our guide to{' '}
                      <a href="/blog/christian-alternatives-to-youtube-for-kids">
                        Christian alternatives to YouTube for kids
                      </a>.
                    </>
                  ) : (
                    f.a
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">🚫</span>No ads, ever</li>
          <li><span aria-hidden="true">🛡️</span>COPPA-compliant</li>
          <li><span aria-hidden="true">🔓</span>Cancel anytime</li>
        </ul>
        <h2>See it for yourself</h2>
        <p className="hv-close-fine" style={{ margin: '0 auto 22px', maxWidth: '38em' }}>
          The quiz takes two minutes and shows you how it works before you pay anything.
        </p>
        <a className="hv-cta" href="/quiz?ref=about">
          <span className="hv-cta-play" aria-hidden="true" />
          Get started
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
      <AboutV2 />
    </V2Shell>
  )
}
