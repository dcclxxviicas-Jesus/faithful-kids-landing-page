// Shared site chrome — matches the nav/footer used on the homepage and blog.
// Use on every public content page so nothing ships off-brand.

export function SiteNav({ active }: { active?: 'blog' | 'trivia' | 'printables' | 'churches' }) {
  return (
    <nav className="nav no-print">
      <div className="nav-inner">
        <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo-sm.png" alt="Faithful Kids" className="nav-logo-img" /> Faithful Kids
        </a>
        <div className="nav-links">
          <a href="/blog" style={active === 'blog' ? { color: 'var(--primary)', fontWeight: 700 } : undefined}>Blog</a>
          <a href="/bible-trivia" style={active === 'trivia' ? { color: 'var(--primary)', fontWeight: 700 } : undefined}>Trivia Game</a>
          <a href="/printables" style={active === 'printables' ? { color: 'var(--primary)', fontWeight: 700 } : undefined}>Printables</a>
          <a href="/churches" style={active === 'churches' ? { color: 'var(--primary)', fontWeight: 700 } : undefined}>Churches</a>
        </div>
        <a href="/quiz" className="btn-nav" style={{ textDecoration: 'none' }}>Try Free</a>
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
          <a href="/blog">Blog</a>
          <a href="/bible-trivia">Trivia Game</a>
          <a href="/printables">Printables</a>
          <a href="/churches">Churches</a>
          <a href="/support">Support</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
        <p className="footer-copy">&copy; 2026 Faithful Kids. All rights reserved.</p>
      </div>
    </footer>
  )
}
