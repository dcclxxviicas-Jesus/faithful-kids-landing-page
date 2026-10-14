import Link from 'next/link'
import { Baloo_2 } from 'next/font/google'
import { SiteFooter, SiteNav } from '@/app/components/SiteChrome'
import './not-found.css'

/**
 * The 404. Next's default was a bare "404 | This page could not be found" on
 * white, with no nav, no footer and nowhere to go. Owner, Oct 13 2026: "make
 * it beautiful... make it blessed, and give them links to go to other pages."
 *
 * The lost sheep (Luke 15) is the Bible's own story about a wrong turn that
 * ends well, so the page leans on it: the hero art from that lesson, a line
 * that says plainly this page does not exist, the Aaronic blessing, and the
 * six places a visitor is most likely to have been looking for.
 *
 * Next marks not-found responses noindex on its own; nothing to add here.
 */

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'

/* Same rounded display face as the homepage, loaded on this page only. */
const display = Baloo_2({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const PLACES = [
  { href: '/bible-stories-for-kids', icon: '📖', title: 'Bible stories', blurb: 'Every story, in Bible order, with a free video' },
  { href: '/bible-trivia', icon: '🏆', title: 'Trivia game', blurb: 'Play a round, no sign-up' },
  { href: '/printables', icon: '🖍️', title: 'Printables', blurb: 'Coloring pages and word searches' },
  { href: '/homeschool', icon: '🏡', title: 'Homeschool', blurb: 'A Bible curriculum kids ask for' },
  { href: '/churches', icon: '⛪', title: 'For churches', blurb: 'Free for your Sunday school' },
  { href: '/quiz', icon: '▶️', title: 'Start free', blurb: 'See what your kids would watch' },
]

export default function NotFound() {
  return (
    <div className={`${display.variable} nf`}>
      <SiteNav />
      <main className="nf-main">
        <section className="nf-hero">
          <div className="nf-copy">
            <p className="nf-eyebrow">404 &middot; Page not found</p>
            <h1 className="nf-title">
              Looks like this page <span>wandered off.</span>
            </h1>
            <p className="nf-lead">
              The page you were looking for isn&rsquo;t here. Maybe the link was old, or a letter
              went astray. Like the one sheep in Luke 15, it has gone missing. The good news is
              that around here, lost things get found.
            </p>
            <div className="nf-actions">
              <Link href="/" className="nf-btn nf-btn-primary">Back to the homepage</Link>
              <Link href="/bible-stories-for-kids" className="nf-btn nf-btn-ghost">Browse Bible stories</Link>
            </div>
          </div>
          <div className="nf-art" aria-hidden="true">
            <img
              src={`${CDN}/blog-images/the-lost-sheep-for-kids-hero.webp`}
              alt=""
              width={1536}
              height={1024}
              loading="eager"
              decoding="async"
            />
          </div>
        </section>

        <section className="nf-places" aria-labelledby="nf-places-h">
          <h2 id="nf-places-h">Where would you like to go?</h2>
          <ul className="nf-grid">
            {PLACES.map(p => (
              <li key={p.href}>
                <Link href={p.href} className="nf-card">
                  <span className="nf-card-ico" aria-hidden="true">{p.icon}</span>
                  <span className="nf-card-body">
                    <strong>{p.title}</strong>
                    <span>{p.blurb}</span>
                  </span>
                  <span className="nf-card-arrow" aria-hidden="true">&rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="nf-blessing">
          <blockquote>
            <p>
              &ldquo;The Lord bless you and keep you; the Lord make his face shine on you and be
              gracious to you; the Lord turn his face toward you and give you peace.&rdquo;
            </p>
            <cite>Numbers 6:24&ndash;26</cite>
          </blockquote>
          <p className="nf-blessing-note">
            Wherever you were headed, we hope you find it. And if you think something on our site
            is broken, <a href="/support">tell us</a> and we&rsquo;ll fix it.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
