// Shared site chrome — the ONE nav and footer for every public page.
// The homepage used to carry its own hardcoded nav of #anchors that linked to
// no other page; it now uses this, so every page navigates the same way.

import { MobileMenu, type NavItem } from './MobileMenu'
import { NavCta } from './NavCta'

export type NavActive = 'blog' | 'stories' | 'trivia' | 'printables' | 'churches'

const NAV_ITEMS: NavItem[] = [
  { href: '/bible-stories-for-kids', label: 'Bible Stories', key: 'stories' },
  { href: '/blog', label: 'Bible Guides', key: 'blog' },
  { href: '/bible-trivia', label: 'Trivia Game', key: 'trivia' },
  { href: '/printables', label: 'Printables', key: 'printables' },
  { href: '/churches', label: 'Churches', key: 'churches' },
]

export function SiteNav({
  active,
  minimal = false,
  ctaHref,
  ctaLabel = 'Get started',
  hideCta = false,
}: {
  active?: NavActive
  /**
   * Conversion mode: logo + one CTA, no links at all.
   *
   * For the landing page. Content pages exist to be found and then explored,
   * so they carry the full nav; the landing page exists to sell one thing, and
   * every header link there is an exit from that. Owner's call, and correct —
   * the homepage takes 145 visitors/month against ~2,880 on the blog, so the
   * discovery nav belongs where people actually arrive.
   */
  minimal?: boolean
  /** The homepage nav has always sent to /checkout, not /quiz. Kept as-is
   *  rather than silently rerouting the funnel. */
  /** Overrides the automatic quiz/checkout routing. */
  ctaHref?: string
  /** Drop the nav CTA entirely — the landing page has its own, in the hero. */
  hideCta?: boolean
  ctaLabel?: string
}) {
  const items: NavItem[] = minimal ? [] : NAV_ITEMS

  return (
    <nav className="nav no-print" aria-label="Main navigation">
      <div className="nav-inner">
        <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo-sm.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids
        </a>

        {!minimal && <div className="nav-links">
          {items.map(item => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.key && item.key === active ? 'page' : undefined}
              style={item.key && item.key === active ? { color: 'var(--primary)', fontWeight: 700 } : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>}

        <div className="nav-actions">
          {/* Content pages send first-timers to the quiz and returning
              quiz-takers straight to checkout. An explicit ctaHref — which the
              homepage passes — always wins, because homepage traffic has
              already read the pitch. */}
          {!hideCta && <NavCta href={ctaHref} label={ctaLabel} />}
          {!minimal && <MobileMenu items={items} active={active} ctaHref={ctaHref} />}
        </div>
      </div>
    </nav>
  )
}

export function SiteFooter() {
  return (
    <footer className="footer no-print">
      <div className="footer-inner">
        <div className="footer-logo">
          <img src="/logo-sm.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids
        </div>
        <div className="footer-links">
          <a href="/bible-stories-for-kids">Bible Stories</a>
          <a href="/blog">Bible Guides</a>
          <a href="/bible-trivia">Trivia Game</a>
          <a href="/printables">Printables</a>
          <a href="/churches">Churches</a>
          <a href="/about">About</a>
          <a href="/support">Support</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="mailto:team@faithfulkids.app">Contact</a>
        </div>
        {/* The channel publishes lesson videos daily and already sends real
            traffic (25 people in 90 days) despite being linked nowhere. The
            footer is the one place a link like this costs nothing: anyone who
            has scrolled this far is looking for the company, not deciding
            whether to subscribe. Plain <a> so the footer stays server-rendered;
            PostHog autocapture records the click. */}
        <div className="footer-social">
          <a
            href="https://www.youtube.com/@FaithfulKidsApp"
            target="_blank"
            rel="noopener"
            aria-label="Faithful Kids on YouTube"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="20" height="20">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
            </svg>
            <span>Watch on YouTube</span>
          </a>
        </div>

        <p className="footer-copy">&copy; 2026 Faithful Kids. All rights reserved.</p>
      </div>
    </footer>
  )
}
