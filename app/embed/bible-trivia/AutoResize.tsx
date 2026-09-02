'use client'

import { useEffect } from 'react'

/* Tells the host page how tall this iframe needs to be.
 *
 * Measures the CONTENT wrapper, not documentElement. The wrapper now fills
 * whatever height the frame gives it (see page.tsx), so documentElement's
 * height is the host's frame height — broadcasting that would just echo the
 * host's own number back at it and the frame could never shrink.
 *
 * This is the better outcome for hosts using our published snippet. It is no
 * longer the primary fix: most hosts size their own frames and will not add a
 * listener for one game, so the CSS has to stand on its own.
 */
const MSG = 'fk-trivia-height'
export const CONTENT_ID = 'fk-embed-content'

export function AutoResize() {
  useEffect(() => {
    if (window.parent === window) return   // not framed — nothing to tell

    const el = document.getElementById(CONTENT_ID)
    if (!el) return

    let last = 0
    const send = () => {
      // Content height plus the page's own vertical padding.
      const style = getComputedStyle(document.body)
      const pad = parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0')
      const h = Math.ceil(el.getBoundingClientRect().height + pad) + 16
      if (!h || Math.abs(h - last) < 2) return
      last = h
      try { window.parent.postMessage({ type: MSG, height: h }, '*') } catch { /* cross-origin refusal */ }
    }

    send()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(send) : null
    ro?.observe(el)
    const mo = new MutationObserver(send)
    mo.observe(el, { childList: true, subtree: true, characterData: true })
    const t = window.setInterval(send, 1000)
    window.addEventListener('load', send)

    return () => { ro?.disconnect(); mo.disconnect(); window.clearInterval(t); window.removeEventListener('load', send) }
  }, [])

  return null
}
