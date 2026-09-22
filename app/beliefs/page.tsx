import type { Metadata } from 'next'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'

/**
 * Statement of faith.
 *
 * Built because homeschool-group leaders keep asking for one before they will
 * recommend us to their families — four separate requests in a week. A group
 * leader cannot vouch for a Bible product to their members without knowing
 * what it teaches, and until this page existed the honest answer was a page
 * that did not exist.
 *
 * Rules for editing this page:
 * - The doctrinal wording is the OWNER'S, not marketing copy. Do not reword,
 *   tighten, or "improve" it without his explicit approval. It is a statement
 *   made under his name to other Christians.
 * - Deliberately CREEDAL, not denominational. We serve Baptist, Wesleyan,
 *   Reformed and Catholic families, and have reached out to Catholic groups
 *   directly. Anything that takes a side on baptism, church government,
 *   eschatology or the sacraments excludes families we are actively serving —
 *   and would make this page useless for the very leaders who asked for it.
 * - Plain voice, like /about. No selling. Someone arrives here to check us
 *   out, not to be pitched; a CTA in the middle of a statement of faith reads
 *   as insincere.
 */

const TITLE = 'What We Believe'
const DESCRIPTION =
  'The statement of faith behind Faithful Kids: the Bible as God’s Word, the Trinity, and salvation in Jesus Christ. Creedal common ground for Christian families across traditions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://faithfulkids.app/beliefs' },
  openGraph: {
    title: `${TITLE} — Faithful Kids`,
    description: DESCRIPTION,
    url: 'https://faithfulkids.app/beliefs',
    siteName: 'Faithful Kids',
    type: 'website',
  },
}

/* Numbered so a group leader can cite one in an email to their members. */
const BELIEFS: { heading: string; body: string }[] = [
  {
    heading: 'The Bible',
    /* "and our final authority" was in the first draft and was removed
       deliberately. It is sola scriptura — a Reformation distinctive. Catholic
       and Orthodox Christians affirm that Scripture is inspired and true
       without hesitation, but hold it alongside Sacred Tradition, so that
       clause is the exact point at which this page would stop being common
       ground. Everything else here is affirmed by every tradition named
       below. Do not restore it without asking the owner. */
    body: 'The Bible is the inspired, true Word of God.',
  },
  {
    heading: 'God',
    body: 'There is one God, eternally Father, Son, and Holy Spirit.',
  },
  {
    heading: 'Jesus Christ',
    /* Note what is absent: "by grace through faith" NOT "by faith alone".
       The phrase as written is Ephesians 2:8 and every tradition affirms it;
       adding "alone" makes it sola fide and excludes Catholic families. This
       is load-bearing, not loose wording. */
    body: 'Jesus Christ, God’s Son, is fully God and fully man. He lived a sinless life, died for our sins, and rose again. Salvation is found in him, by grace through faith.',
  },
  {
    heading: 'How we teach',
    body: 'Every lesson aims to teach Scripture faithfully, in context, and to point children toward Jesus.',
  },
  {
    heading: 'Who this is for',
    body: 'Faithful Kids is made for Christian families across traditions. We hold to historic, biblical Christianity on the common ground of the Apostles’ and Nicene Creeds, rather than any single denomination’s distinctives.',
  },
]

export default function Beliefs() {
  return (
    <>
      <SiteNav />

      <main id="main-content">
        <section className="blog-hero">
          <span className="section-label">Statement of Faith</span>
          <h1>{TITLE}</h1>
          <p className="blog-hero-sub">
            Parents and group leaders ask what we teach before they hand this to their
            children. That is the right question, and this is the plain answer.
          </p>
        </section>

        <section className="stories-section">
          <div className="stories-faq">
            {BELIEFS.map((b, i) => (
              <div key={b.heading} className="stories-faq-item">
                <h2>{i + 1}. {b.heading}</h2>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stories-section stories-alt">
          <h2>Why this is creedal rather than denominational</h2>
          <p className="section-sub">
            Faithful Kids is built for Christian families across traditions &mdash;
            Baptist, Wesleyan, Reformed, Anglican, non-denominational, Catholic and
            Orthodox alike. We deliberately stand on the ground those traditions share
            &mdash; the Apostles&rsquo; and Nicene Creeds &mdash; and leave the
            distinctives that separate them to you, your family and your church. Where a
            story touches something traditions read differently, the lesson stays with what
            Scripture says and leaves the interpretation to you.
          </p>
          {/* Deliberately does NOT claim a per-denomination content path. The
              quiz asks the question, but the answer is never stored and never
              changes a single lesson — verified in bible-kids: `denomination`
              appears only in the quiz's own result copy. Claiming it here, on
              the one page whose entire job is being trustworthy to people
              checking our integrity, would be the worst possible place for a
              feature that does not exist. */}
          <p className="section-sub">
            Every story is reviewed for doctrinal accuracy by practising Christians before
            it goes live.
          </p>
        </section>

        <section className="stories-section">
          <h2>Questions, or something we got wrong</h2>
          <p className="section-sub">
            If you lead a homeschool group, a co-op or a childrens&rsquo; ministry and need
            something more specific before recommending us, email{' '}
            <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a> and a real
            person will answer. If you think a lesson departs from this statement, tell us
            which one &mdash; we would rather fix it than defend it.
          </p>
          <p className="section-sub">
            More about the company, pricing and safety is on the{' '}
            <a href="/about">about page</a>. Faithful Kids is{' '}
            <a href="/churches">free for churches</a>.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
