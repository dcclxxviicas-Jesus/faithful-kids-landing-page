import type { Metadata } from 'next'
import '../home.css'
import '../v2-pages.css'
import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Shell, V2Hero } from '@/app/v2-shell'

const TITLE = 'What We Believe'
const DESCRIPTION =
  'The statement of faith behind Faithful Kids: the Bible as God\u2019s Word, the Trinity, and salvation in Jesus Christ. Creedal common ground for Christian families across traditions.'

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

/**
 * VISUAL TEST of /beliefs. Presentation only.
 *
 * The rules from the live page carry over unchanged and are not negotiable
 * here either:
 *  - the doctrinal wording is the OWNER'S. Not one word is reworded, tightened
 *    or "improved". "The Bible is the inspired, true Word of God" does NOT get
 *    "and our final authority" (sola scriptura), and "by grace through faith"
 *    does NOT get "alone" (sola fide). Both would exclude families we serve.
 *  - deliberately creedal, not denominational.
 *  - NO CALL TO ACTION. Someone arrives here to check our integrity, not to be
 *    sold to, and a Get-started button in the middle of a statement of faith
 *    reads as insincere. Every other page in this redesign ends with one; this
 *    one deliberately does not.
 *  - the five articles stay <h2>, numbered, so a group leader can cite one.
 */

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

function BeliefsV2() {
  return (
    <>
      <SiteNav />

      <main id="main-content">

      <V2Hero
        short
        art="beliefs"
        alt="A wooden table by a window in soft morning light with a large open Bible, an unlit candle, a glass of water and a sprig of olive leaves"
        eyebrow="Statement of Faith"
        title="What We Believe"
        sub={<>Parents and group leaders ask what we teach before they hand this to their
          children. That is the right question, and this is the plain answer.</>}
      />

      <section className="v2-section">
        <div className="v2-wrap is-narrow">
          <ol className="be-list">
            {BELIEFS.map((b, i) => (
              <li key={b.heading} className="be-item">
                {/* The number is part of the heading TEXT, because the live
                    page has it there and a group leader cites "point 3". A
                    separate badge would have rendered "1. 1. The Bible". */}
                <h2><span className="be-n">{i + 1}.</span> {b.heading}</h2>
                <p>{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="v2-section is-alt">
        <div className="v2-wrap is-narrow v2-body">
          <h2 className="be-h2">Why this is creedal rather than denominational</h2>
          <p>
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
              changes a single lesson. Claiming it here, on the one page whose
              entire job is being trustworthy to people checking our integrity,
              would be the worst possible place for a feature that does not
              exist. */}
          <p>
            Every story is reviewed for doctrinal accuracy by practising Christians before
            it goes live.
          </p>
        </div>
      </section>

      <section className="v2-section">
        <div className="v2-wrap is-narrow v2-body">
          <h2 className="be-h2">Questions, or something we got wrong</h2>
          <p>
            If you lead a homeschool group, a co-op or a childrens&rsquo; ministry and need
            something more specific before recommending us, email{' '}
            <a href="mailto:team@faithfulkids.app">team@faithfulkids.app</a> and a real
            person will answer. If you think a lesson departs from this statement, tell us
            which one &mdash; we would rather fix it than defend it.
          </p>
          <p>
            More about the company, pricing and safety is on the{' '}
            <a href="/about">about page</a>. Faithful Kids is{' '}
            <a href="/churches">free for churches</a>.
          </p>
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
      <BeliefsV2 />
    </V2Shell>
  )
}
