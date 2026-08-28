'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type NavItem = { href: string; label: string; key?: string }

/**
 * The site's only navigation on phones.
 *
 * Until now `.nav-links` was `display:none` under 768px with no menu behind it,
 * so every page rendered a logo and a Try Free button and nothing else. That is
 * ~45% of blog traffic (1,294 visitors in 30 days) with no route to the trivia
 * game, printables, stories or guides.
 */
export function MobileMenu({ items, active, ctaHref = '/quiz' }: { items: NavItem[]; active?: string; ctaHref?: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Lock the page behind the panel, and let Escape out.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        onClick={() => setOpen(v => !v)}
      >
        <span className={`nav-toggle-bars${open ? ' is-open' : ''}`} aria-hidden="true">
          <span /><span /><span />
        </span>
      </button>

      {/* Portalled to <body>. The nav has backdrop-filter, which makes it a
          containing block for position:fixed descendants -- rendered inside it,
          the scrim's inset:0 resolved to the 68px nav bar instead of the
          viewport, so taps below the bar fell through to the page. */}
      {mounted && open && createPortal(
        <div id="site-mobile-menu" className="nav-mobile is-open">
          <button
            type="button"
            className="nav-mobile-scrim"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="nav-mobile-panel" role="dialog" aria-modal="true" aria-label="Site menu">
            <ul className="nav-mobile-list">
              {items.map(item => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active && item.key === active ? 'page' : undefined}
                    className={active && item.key === active ? 'is-active' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href={ctaHref} className="nav-mobile-cta" onClick={() => setOpen(false)}>
              Try Free for 3 Days
            </a>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
