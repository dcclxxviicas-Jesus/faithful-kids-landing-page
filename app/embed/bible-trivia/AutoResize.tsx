'use client'

import { useEffect } from 'react'

/* Tells the host page how tall this iframe needs to be.
 *
 * The three game screens are genuinely different heights — start ~390px,
 * question ~600px, results ~700px — so no fixed height is right. The snippet
 * shipped with height="780", which meant ~400px of blank white under the start
 * screen on every host page. It read as broken.
 *
 * We post the document height on mount and on every change; the snippet's
 * listener resizes the iframe. If the host strips the script the iframe keeps
 * its hardcoded height and nothing is worse than before.
 */
const MSG = 'fk-trivia-height'

export function AutoResize() {
  useEffect(() => {
    if (window.parent === window) return   // not framed — nothing to tell

    let last = 0
    const send = () => {
      const h = Math.ceil(document.documentElement.getBoundingClientRect().height)
      if (!h || Math.abs(h - last) < 2) return
      last = h
      try { window.parent.postMessage({ type: MSG, height: h }, '*') } catch { /* cross-origin refusal */ }
    }

    send()
    // Screen changes are React state, not layout events, so observe the DOM.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(send) : null
    ro?.observe(document.documentElement)
    const mo = new MutationObserver(send)
    mo.observe(document.body, { childList: true, subtree: true, characterData: true })
    // Belt and braces for late-loading fonts/images.
    const t = window.setInterval(send, 1000)
    window.addEventListener('load', send)

    return () => { ro?.disconnect(); mo.disconnect(); window.clearInterval(t); window.removeEventListener('load', send) }
  }, [])

  return null
}
