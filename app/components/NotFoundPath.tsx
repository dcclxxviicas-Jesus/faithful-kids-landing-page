'use client'

import { usePathname } from 'next/navigation'

/**
 * Shows the address that was actually requested, so a visitor can see the
 * typo or the dead link for themselves. Client-side because not-found.tsx
 * renders without request context; usePathname has it.
 */
export function NotFoundPath() {
  const path = usePathname()
  if (!path || path === '/') return null
  return (
    <p className="nf-url">
      There is nothing at <code>faithfulkids.app{path}</code>
    </p>
  )
}
