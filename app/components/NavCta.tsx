'use client'

import { useCtaHref } from './useCtaHref'

/* Just the nav's call to action, split out as a client component.
 *
 * SiteChrome is a server component and the blog pages are what earn the
 * organic traffic, so making the whole nav client-side to read one
 * localStorage flag would be a poor trade. Only this link needs to think. */
export function NavCta({ href, label, className = 'btn-nav' }: {
  href?: string
  label: string
  className?: string
}) {
  const auto = useCtaHref()
  return (
    <a href={href ?? auto} className={className} style={{ textDecoration: 'none' }}>
      {label}
    </a>
  )
}
