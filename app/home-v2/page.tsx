'use client'

import { SiteFooter, SiteNav } from '@/app/components/SiteChrome'
import { STORIES } from '@/app/components/stories'
import { VideoTile } from '@/app/components/VideoTile'

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'

/* Resolve by title, never by index — indices shifted once before and silently
   repointed a whole section. */
const byTitle = (t: string) => STORIES.find(s => s.title === t)
const SHELF = ['In the Beginning: Creation', 'A Baby in a Basket', 'Noah & the Great Flood']
  .map(byTitle).filter(Boolean) as typeof STORIES

/* Prices are the real ones from app/api/checkout/route.ts (1299 / 9700) and
   the 7-day trial is annual-only, exactly as Stripe is configured. */
const MONTHLY = 12.99
const ANNUAL = 97
const PER_MONTH = (ANNUAL / 12).toFixed(2)

export default function HomeV2() {
  return (
    <>
      <div className="hv-testbar">
        Visual test — not linked from the site and not indexed. The live homepage is unchanged at{' '}
        <a href="/">faithfulkids.app</a>.
      </div>

      <SiteNav />

      <section className="hv-hero">
        <img
          className="hv-hero-art"
          src={`${CDN}/home-v2/hero-jesus-kids.webp`}
          alt="Jesus sitting under a tree reading a storybook to a group of happy children"
          width={1536}
          height={1024}
          fetchPriority="high"
        />
        <div className="hv-hero-inner">
          <p className="hv-eyebrow">Bible stories for kids ages 5&ndash;15</p>
          <h1 className="hv-h1">
            Where kids{' '}
            <span className="hv-nb">
              fall in{' '}
              <span className="hv-love">
                <span className="l l1">l</span><span className="l l2">o</span>
                <span className="l l3">v</span><span className="l l4">e</span>
              </span>
            </span>{' '}
            with the Bible
          </h1>
          <p className="hv-sub">
            300+ short story videos, Genesis to Revelation. About two minutes each,
            with a quiz and a reflection after every one. No ads, no algorithm, no comments.
          </p>
          <a className="hv-cta" href="/quiz">
            <span className="hv-cta-play">&#9654;</span>
            Start watching free
          </a>
          <p className="hv-fine">
            Yearly plan starts with a 7-day free trial &middot; cancel any time
          </p>
        </div>
      </section>

      <div className="hv-shelf-wrap">
        <div className="hv-shelf">
          <h2>Watch one right now</h2>
          <p className="hv-shelf-sub">
            Real lessons, free to play here. Nothing to sign up for.
          </p>
          <div className="hv-tiles">
            {SHELF.map(s => (
              <VideoTile
                key={s.title}
                src={s.src}
                poster={s.poster}
                title={s.title}
                badge={s.badge}
                location="home-v2-shelf"
                showLabels
              />
            ))}
          </div>
          <p className="hv-note">31 series &middot; 300+ lessons &middot; new ones every week</p>
        </div>
      </div>

      <section className="hv-how">
        <div className="hv-how-head">
          <p className="hv-eyebrow">What a lesson looks like</p>
          <h2>Watch. Quiz. Reflect.</h2>
          <svg className="hv-swash" viewBox="0 0 300 12" aria-hidden="true">
            <path d="M4 8 C 70 2, 150 11, 296 4" stroke="#16a34a" strokeWidth="6"
                  fill="none" strokeLinecap="round" />
          </svg>
          <p className="hv-sub" style={{ marginTop: 14 }}>
            Every story follows the same gentle rhythm, so a child always knows what comes next.
          </p>
        </div>
        <div className="hv-steps">
          <div className="hv-step">
            <div className="hv-step-ico">📖</div>
            <h3>Watch the story</h3>
            <p>About two minutes, retold from Scripture with the verse on screen.</p>
          </div>
          <div className="hv-step">
            <div className="hv-step-ico">✅</div>
            <h3>Answer a few questions</h3>
            <p>One at a time, with a streak to chase and stars to win back.</p>
          </div>
          <div className="hv-step">
            <div className="hv-step-ico">💭</div>
            <h3>Reflect on it</h3>
            <p>Tap a card to say what they think. No typing, so little ones can join in.</p>
          </div>
          <div className="hv-step">
            <div className="hv-step-ico">🏆</div>
            <h3>Keep going</h3>
            <p>Levels from Seedling to Bible Master, and the next series unlocks.</p>
          </div>
        </div>
      </section>

      <section className="hv-parents">
        <h2>What parents say</h2>
        <div className="hv-quotes">
          <div className="hv-quote">
            <p>&ldquo;I used to dread handing my kids the iPad. Now my daughter asks for
              &lsquo;the Bible one&rsquo; instead of YouTube. She told her grandmother the whole
              story of Noah last Sunday. My heart.&rdquo;</p>
            <cite>Maria S.<span>Mom of 3 (ages 4, 7 &amp; 10)</span></cite>
          </div>
          <div className="hv-quote">
            <p>&ldquo;Best $13/month I spend. My son watched David &amp; Goliath four times in a
              row and then acted it out in the backyard. That&rsquo;s the kind of screen time I
              can get behind.&rdquo;</p>
            <cite>James K.<span>Dad of 2 (ages 5 &amp; 8)</span></cite>
          </div>
          <div className="hv-quote">
            <p>&ldquo;We cancelled YouTube Kids. This replaced it completely. My kids are watching
              the Good Samaritan instead of whatever the algorithm serves up. No contest.&rdquo;</p>
            <cite>Michael T.<span>Dad of 3 (ages 4, 8 &amp; 11)</span></cite>
          </div>
        </div>
      </section>

      <section className="hv-pricing">
        <h2>One price. Every story. Every kid in the house.</h2>
        <p>Unlimited kid profiles, all 31 series, on every device you own.</p>
        <div className="hv-plans">
          <div className="hv-plan is-best">
            <p className="hv-plan-name">Monthly</p>
            <p className="hv-price">${MONTHLY}<small> /month</small></p>
            <ul>
              <li>300+ lessons, Genesis to Revelation</li>
              <li>About two minutes each, with a quiz and a reflection</li>
              <li>No ads, no algorithm, no comments</li>
            </ul>
            <a className="hv-plan-cta" href="/checkout?plan=monthly">Get started</a>
          </div>
          <div className="hv-plan">
            <span className="hv-tag">Save {Math.round((1 - ANNUAL / (MONTHLY * 12)) * 100)}%</span>
            <p className="hv-plan-name">Yearly</p>
            <p className="hv-price">${ANNUAL}<small> /year &middot; ${PER_MONTH}/mo</small></p>
            <ul>
              <li>Everything in monthly</li>
              <li>Starts with a 7-day free trial</li>
              <li>Cancel any time before it renews</li>
            </ul>
            <a className="hv-plan-cta" href="/checkout?plan=annual">Start free trial</a>
          </div>
        </div>
      </section>

      <section className="hv-close">
        <p className="hv-blob">Learn &middot; Have fun &middot; Grow in faith</p>
        <h2>Make screen time the best part of their day</h2>
        <a className="hv-cta" href="/quiz">
          <span className="hv-cta-play">&#9654;</span>
          Start watching free
        </a>
      </section>

      <SiteFooter />
    </>
  )
}
