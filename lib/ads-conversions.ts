/* Google Ads micro-conversion helpers (added Nov 3, 2026).
   The base tag (AW-18543438104) loads site-wide in app/layout.tsx; these fire
   event snippets for the two "manual event" conversion actions created in the
   Ads UI the same day. They exist so the brand-new Search campaign accumulates
   conversion signal faster than the rare /success purchase alone — Begin
   checkout feeds future smart bidding, Quiz completed is observation-only.
   gtag may be blocked by ad blockers or missing on old cached pages: always a
   silent no-op, never block the UI. */
const ADS_ID = 'AW-18543438104'
export const ADS_LABELS = {
  beginCheckout: 'VUjuCMKX0bEdEJjSmYpF',
  quizCompleted: 'S8gnCMWX0bEdEJjSmYpF',
} as const

export function adsConversion(label: keyof typeof ADS_LABELS) {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'conversion', { send_to: `${ADS_ID}/${ADS_LABELS[label]}` })
    }
  } catch { /* never block */ }
}
