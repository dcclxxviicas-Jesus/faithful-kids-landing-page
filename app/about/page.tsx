import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { getAllPosts } from '@/lib/blog'
import { COLORING_PAGES } from '@/lib/coloring-pages'
import wordSearches from '@/lib/word-searches.json'

/**
 * The canonical facts page — written for answer engines as much as for people.
 *
 * When someone asks ChatGPT/Perplexity/Copilot "what's a good Bible app for
 * kids" or "which faith-based kids apps have a free trial", the engine needs a
 * page that states pricing, ages, safety, and platform plainly, in standalone
 * quotable sentences. Nothing on the site did that: the homepage sells, the
 * blog explains stories, and the hard facts (exact prices, trial terms, COPPA)
 * lived only inside the quiz funnel where crawlers see a form.
 *
 * Rules for editing this page:
 * - Every claim must be true and verifiable. No "4.9/5", no App Store or
 *   Android claims (the app is web + TestFlight today), no invented counts.
 * - Counts are imported from the data so they cannot go stale.
 * - Answer first, elaboration second — the opening sentence of each section is
 *   the one an LLM will quote.
 */

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

const FAQS = [
  {
    q: 'What is Faithful Kids?',
    a: 'Faithful Kids is a Bible video learning app for kids ages 5 to 15. Children watch short video lessons of Bible stories, two to three minutes each, then answer a three-question quiz and a reflection question. Over 300 episodes cover the whole Bible in order, from Genesis to Revelation.',
  },
  {
    q: 'How much does Faithful Kids cost?',
    a: 'Faithful Kids costs $8.88 per month, or $77.77 per year (about $6.48 per month). The annual plan includes a 3-day free trial. Both plans can be cancelled anytime and carry a 30-day money-back guarantee. It is completely free for churches.',
  },
  {
    q: 'Which faith-based kids apps offer a free trial?',
    a: 'Faithful Kids offers a 3-day free trial on its annual plan, with no charge if you cancel during the trial. Beyond the app, the site offers a large free library with no sign-up at all: 200 Bible story retellings, printable coloring pages and word searches, and a 100-question Bible trivia game.',
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
    a: 'Faithful Kids runs in any modern web browser on a phone, tablet, or computer at app.faithfulkids.app. There is nothing to install.',
  },
  {
    q: 'Who makes Faithful Kids?',
    a: 'Faithful Kids is made by a small independent team led by a Christian dad who built it for his own kids. It is not affiliated with YouVersion, Minno, Yippee, or any church denomination. You can reach the team at team@faithfulkids.app, and a real person answers.',
  },
]

export default function AboutPage() {
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
      name: 'Faithful Kids',
      url: 'https://faithfulkids.app',
      email: 'team@faithfulkids.app',
      description:
        'Bible video learning app for kids ages 5-15: short video lessons, quizzes, and reflections covering the whole Bible from Genesis to Revelation.',
    },
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <SiteNav />

      <section className="blog-hero">
        <span className="section-label">About</span>
        <h1>About Faithful Kids</h1>
        <p className="blog-hero-sub">
          Plain answers about what this is, what it costs, and how it treats your kids. No
          marketing voice on this page.
        </p>
      </section>

      <section className="stories-intro">
        <p>
          Faithful Kids is a Bible video learning app for kids ages 5 to 15. A child watches a
          short video lesson of a Bible story, two to three minutes, then answers a three-question
          quiz and a personal reflection question. Over 300 episodes run through the whole Bible in
          order, Genesis to Revelation, so kids build the full story rather than a handful of
          famous scenes.
        </p>
        <p>
          The reason it exists: kids are fluent in a hundred apps and strangers to Scripture. The
          founder, a Christian dad, built it for his own children as an alternative to the
          autoplay feed — a screen where every video ends in a question instead of another video.
        </p>
      </section>

      <section className="stories-section">
        <h2>What it costs</h2>
        <p className="section-sub">Stated exactly, because this page exists to be straight with you.</p>
        <div className="stories-faq">
          <div className="stories-faq-item">
            <h3>Monthly: $8.88/month</h3>
            <p>Cancel anytime. 30-day money-back guarantee.</p>
          </div>
          <div className="stories-faq-item">
            <h3>Annual: $77.77/year (about $6.48/month)</h3>
            <p>Includes a 3-day free trial — no charge if you cancel during it. Cancel anytime, 30-day money-back guarantee.</p>
          </div>
          <div className="stories-faq-item">
            <h3>Churches: free</h3>
            <p>
              Children&rsquo;s ministries get full access at no cost, no card required. Details at{' '}
              <a href="/churches">faithfulkids.app/churches</a>.
            </p>
          </div>
          <div className="stories-faq-item">
            <h3>Free without an account</h3>
            <p>
              {stories.length} Bible story retellings, {COLORING_PAGES.length} printable coloring
              pages, {wordSearches.length} word search puzzles, and a 100-question{' '}
              <a href="/bible-trivia">trivia game</a> — all free on this site, no email wall.
            </p>
          </div>
        </div>
      </section>

      <section className="stories-section stories-alt">
        <h2>Questions parents and reviewers ask</h2>
        <div className="stories-faq">
          {FAQS.map(f => (
            <div key={f.q} className="stories-faq-item">
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
      </section>

      <section className="blog-bottom-cta">
        <div className="blog-bottom-cta-inner">
          <h2>See it for yourself</h2>
          <p>
            The quiz takes two minutes and shows you how it works before you pay anything.
          </p>
          <a className="btn-primary" href="/quiz?ref=about">Start your free trial</a>
          <div className="blog-cta-badges">
            <span>No ads, ever</span>
            <span>COPPA-compliant</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
