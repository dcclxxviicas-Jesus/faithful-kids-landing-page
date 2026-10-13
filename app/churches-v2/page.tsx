import { SiteNav, SiteFooter } from '@/app/components/SiteChrome'
import { V2Hero, V2Head } from '@/app/v2-shell'

/* Copied character for character from app/churches/page.tsx. Changing it would
   change what the page claims to ministries, which is not what a redesign is
   for. */
const mailto =
  'mailto:team@faithfulkids.app?subject=Church%20partnership%20—%20%5Byour%20church%20name%5D&body=Hi%20Faithful%20Kids%20team%2C%0A%0AChurch%2Fministry%20name%3A%0AWebsite%3A%0AAbout%20how%20many%20kids%20in%20your%20class%3A%0A%0AWe%27d%20love%20free%20access%20for%20our%20kids%20ministry!'

const g = { color: 'var(--hv-green-dark)', fontWeight: 800 }

export default function ChurchesV2() {
  return (
    <>
      <SiteNav active="churches" />

      <main id="main-content">

      <V2Hero
        art="churches"
        alt="A small stone village church with a bell tower on a green hill at morning, a flower-lined path winding up to its door"
        eyebrow="For Churches & Kids Ministries"
        title={<>Faithful Kids is <span className="hv-love"><span className="l l1">f</span><span className="l l2">r</span><span className="l l3">e</span><span className="l l4">e</span></span> for churches</>}
        sub={<>Give your Sunday school or kids ministry full access to our Bible video learning app
          &mdash; 300+ story episodes with quizzes and reflections &mdash; at no cost. We built this
          to serve families, and that starts with the church.</>}
      >
        <a className="hv-cta" href={mailto}>
          <span className="hv-cta-play" aria-hidden="true" />
          Request Free Access &mdash;{' '}
          <span style={{ whiteSpace: 'nowrap' }}>team@faithfulkids.app &rarr;</span>
        </a>
        <p className="hv-close-fine" style={{ maxWidth: '32em', margin: '16px auto 0' }}>
          Clicking opens your email app. Or write us directly at{' '}
          <a href={mailto} style={g}>team@faithfulkids.app</a>. One email &mdash; usually set up
          within 24 hours.
        </p>
      </V2Hero>

      <section className="v2-section">
        <V2Head eyebrow="How It Works" title="Three steps, zero paperwork"
                sub={<>No forms, no calls, no contracts &mdash; just an email.</>} />
        <div className="v2-wrap">
          <div className="v2-steps">
            <div className="v2-step">
              <h3>Email us from your church</h3>
              <p>One short email with your church or ministry name and roughly how many kids you
                serve. That&apos;s the whole application.</p>
            </div>
            <div className="v2-step">
              <h3>We set up free access</h3>
              <p>Your Sunday school class gets full access to everything &mdash; the same product
                families pay for, free for your ministry.</p>
            </div>
            <div className="v2-step">
              <h3>If it blesses your kids, tell your families</h3>
              <p>That&apos;s the whole deal. If Faithful Kids is a blessing to your class, we simply
                ask that you consider adding it to your church&apos;s online resources page. No
                obligation, ever.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-section is-alt">
        <V2Head eyebrow="What Your Ministry Gets" title="Everything families get — free for your class"
                sub="The full app, plus free resources you can use today without signing up for anything." />
        <div className="v2-wrap">
          <div className="v2-grid is-3">
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">📺</div>
              <h3>300+ Bible video episodes</h3>
              <p>Short story episodes across 30+ series, Genesis to Revelation &mdash; each followed
                by a quiz and reflection.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">🏆</div>
              <h3>Quizzes, levels &amp; streaks</h3>
              <p>The gamified structure keeps kids coming back &mdash; great for weekly memory-verse
                and story review.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">📄</div>
              <h3>Free printables</h3>
              <p><a href="/printables" style={g}>Trivia pack, 30-day challenge, bedtime kit</a> &mdash;
                print unlimited copies for your class.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">🧩</div>
              <h3>Embeddable trivia game</h3>
              <p>Put our <a href="/bible-trivia#embed" style={g}>free Bible trivia game</a>{' '}
                (<a href="/blog/bible-trivia-embed-for-church-website" style={g}>setup guide</a>)
                directly on your church website &mdash; kids play right on your page.</p>
              <p>Curious exactly what the kids get? The full{' '}
                <a href="/blog/faithful-kids-scope-and-sequence" style={g}>scope and sequence</a> is
                public. Family pricing lives on our <a href="/pricing" style={g}>pricing page</a>;
                for churches it is simply free. Budgeting the whole ministry year?{' '}
                <a href="/blog/free-bible-curriculum-for-kids-ministry" style={g}>Here&apos;s everything that&apos;s actually free</a>.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">🛡️</div>
              <h3>Safe by design</h3>
              <p>Zero ads, COPPA-compliant privacy, parent dashboard. Nothing in the app links out
                to the open internet.</p>
            </div>
            <div className="v2-card">
              <div className="v2-ico" aria-hidden="true">✝️</div>
              <h3>Scripture-first</h3>
              <p>Nondenominational: episodes retell the Bible&apos;s own stories and cite chapter and
                verse &mdash; no teaching layered on top.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-section">
        <V2Head eyebrow="Common Questions" title="The honest answers" />
        <div className="v2-wrap is-narrow">
          <div className="hv-faq-list">
            <details className="hv-faq-item">
              <summary><h3>What&apos;s the catch?</h3><span className="hv-faq-mark" aria-hidden="true" /></summary>
              <p>There isn&apos;t one. Families pay for Faithful Kids at home; ministry use is free.
                If it blesses your kids, we hope you&apos;ll mention us on your church&apos;s
                resources page &mdash; that&apos;s a request, not a condition.</p>
            </details>
            <details className="hv-faq-item">
              <summary><h3>What&apos;s your doctrinal position?</h3><span className="hv-faq-mark" aria-hidden="true" /></summary>
              <p>Nondenominational and Scripture-first: episodes retell the Bible&apos;s own stories
                and cite chapter and verse, without denominational teaching layered on top.
                We&apos;re happy to share sample episodes so you can review the content before using
                it with your class.</p>
            </details>
            <details className="hv-faq-item">
              <summary><h3>Is it safe for kids?</h3><span className="hv-faq-mark" aria-hidden="true" /></summary>
              <p>Yes &mdash; no ads, no external links, no chat, COPPA-compliant privacy, and a
                PIN-protected parent area. See our <a href="/privacy" style={g}>privacy policy</a>.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="hv-close">
        <ul className="hv-chips">
          <li><span aria-hidden="true">🎁</span>Free for ministries</li>
          <li><span aria-hidden="true">⏱️</span>Set up in 24 hours</li>
          <li><span aria-hidden="true">🤝</span>No obligation</li>
        </ul>
        <h2>Ready to try it with your class?</h2>
        <p className="hv-close-fine" style={{ margin: '0 0 22px' }}>
          Email us your church name and class size &mdash; we&apos;ll take it from there.
        </p>
        <a className="hv-cta" href={mailto}>
          <span className="hv-cta-play" aria-hidden="true" />
          team@faithfulkids.app &rarr;
        </a>
      </section>

      </main>

      <SiteFooter />
    </>
  )
}
