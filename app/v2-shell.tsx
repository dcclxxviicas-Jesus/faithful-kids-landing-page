import { Baloo_2 } from 'next/font/google'

/**
 * Shared chrome for the redesigned test pages (/*-v2).
 *
 * The display face and the .hv2 wrapper are identical on every one of them, and
 * next/font has to be called at module scope, so it lives here rather than
 * being copy-pasted into five layouts that would then drift apart.
 */
export const display = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export function V2Shell({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} hv2`}>{children}</div>
}

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'

/**
 * The page hero. One component so all five pages crop, scrim and scale their
 * art the same way.
 *
 * Every painting is composed for this crop: quiet top third for the headline,
 * interest in the middle band, plain bottom for whatever overlaps it. Three
 * widths because a phone has no business downloading a 1536px painting, and a
 * preload because this is the LCP element on every one of these pages.
 */
export function V2Hero({
  art, alt, eyebrow, title, sub, children, short = false,
}: {
  art: string
  alt: string
  eyebrow?: string
  title: React.ReactNode
  sub?: React.ReactNode
  children?: React.ReactNode
  short?: boolean
}) {
  const src = `${CDN}/home/hero-${art}-1536.webp`
  const set = [512, 768, 1152, 1536].map(w => `${CDN}/home/hero-${art}-${w}.webp ${w}w`).join(', ')
  return (
    <>
      <link rel="preload" as="image" href={src} imageSrcSet={set} imageSizes="100vw" fetchPriority="high" />
      <section className={`hv-hero v2-hero${short ? ' is-short' : ''}`}>
        <img className="hv-hero-art" src={src} srcSet={set} sizes="100vw" alt={alt}
             width={1536} height={1024} fetchPriority="high" />
        <div className="hv-hero-inner">
          {eyebrow && <p className="hv-eyebrow">{eyebrow}</p>}
          <h1 className="hv-h1">{title}</h1>
          {sub && <p className="hv-sub">{sub}</p>}
          {children}
        </div>
      </section>
    </>
  )
}

/** Section heading block, shared so every section on every page lines up. */
export function V2Head({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: React.ReactNode }) {
  return (
    <div className="v2-head">
      {eyebrow && <p className="hv-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {sub && <p className="v2-head-sub">{sub}</p>}
    </div>
  )
}
