'use client'

/* Just the nav's call to action.
 *
 * Every CTA on the site goes to the quiz — owner's call, Sep 1 2026. The
 * quiz is the front door, and the skip-if-you-already-took-it routing that
 * briefly lived here was complexity for a case nobody asked to optimise. */
export function NavCta({ href, label, className = 'btn-nav' }: {
  href?: string
  label: string
  className?: string
}) {
  return (
    <a href={href ?? '/quiz'} className={className} style={{ textDecoration: 'none' }}>
      {label}
    </a>
  )
}
