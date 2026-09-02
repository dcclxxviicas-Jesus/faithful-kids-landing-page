'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

/* Trainly support chat widget.
 *
 * lazyOnload, not afterInteractive: this is a support bubble, not something
 * the page needs to render. The blog pages earn the organic traffic and were
 * deliberately cut to 0 bytes of video until asked; letting a chat widget
 * compete with first paint there would give that back for nothing.
 *
 * Landing site only. It is NOT loaded in bible-kids, which is used directly by
 * children — a third-party script collecting anything there is a COPPA
 * question, not a product one.
 *
 * Nor on /embed/*. Those routes render inside an iframe on somebody else's
 * website; our support bubble appearing over their page is not ours to put
 * there, and it added 230KB to every embed load.
 */
export function SupportChat() {
  const pathname = usePathname()
  if (pathname?.startsWith('/embed')) return null

  return (
    <Script
      src="https://gotrainly.com/widget.js"
      data-agent-id="pub_idrog2ydbi"
      strategy="lazyOnload"
    />
  )
}
