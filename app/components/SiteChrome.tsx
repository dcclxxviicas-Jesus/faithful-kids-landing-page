// Shared site chrome — the ONE nav and footer for every public page.
// The homepage used to carry its own hardcoded nav of #anchors that linked to
// no other page; it now uses this, so every page navigates the same way.

import { MobileMenu, type NavItem } from './MobileMenu'

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
  showPricing = false,
  ctaHref = '/quiz',
  ctaLabel = 'Try Free',
}: {
  active?: NavActive
  /** Homepage only — keeps the in-page Pricing jump the old nav had. */
  showPricing?: boolean
  /** The homepage nav has always sent to /checkout, not /quiz. Kept as-is
   *  rather than silently rerouting the funnel. */
  ctaHref?: string
  ctaLabel?: string
}) {
  const items: NavItem[] = showPricing
    ? [...NAV_ITEMS, { href: '#pricing', label: 'Pricing' }]
    : NAV_ITEMS

  return (
    <nav className="nav no-print" aria-label="Main navigation">
      <div className="nav-inner">
        <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo-sm.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids
        </a>

        <div className="nav-links">
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
        </div>

        <div className="nav-actions">
          <a href={ctaHref} className="btn-nav" style={{ textDecoration: 'none' }}>{ctaLabel}</a>
          <MobileMenu items={items} active={active} ctaHref={ctaHref} />
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
        <p className="footer-copy">&copy; 2026 Faithful Kids. All rights reserved.</p>
      </div>
    </footer>
  )
}
