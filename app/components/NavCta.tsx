'use client'

import { AppStoreBadge, useIsAppleTouch } from './AppStore'

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
  const isAppleTouch = useIsAppleTouch()

  /* On an iPhone the nav's ask is the App Store badge instead of a text
     button — installing is the lower-friction path there, and the badge says
     what it is without needing a label. Everywhere else keeps the text CTA. */
  if (isAppleTouch) return <AppStoreBadge location="nav" height={30} />

  return (
    <a href={href ?? '/quiz'} className={className} style={{ textDecoration: 'none' }}>
      {label}
    </a>
  )
}
