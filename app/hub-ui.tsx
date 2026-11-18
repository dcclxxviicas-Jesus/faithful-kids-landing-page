/**
 * Shared furniture for the five hub pages (/printables, /churches,
 * /bible-stories-for-kids, /bible-trivia, /holidays), redesigned Nov 2026.
 *
 * Owner's brief: keep the storybook feeling, but more elegant, easier to use
 * and less "AI-template" looking: no frosted card floating on a blurred
 * painting, no emoji in pastel squares, no wall of identical boxes. And not a
 * word of copy removed, because these pages rank. Every string the live pages
 * had is still in the HTML; only the presentation moved.
 *
 * Styles live in app/hub.css and are scoped under main.hb, so nothing else on
 * the site (which still uses v2-pages.css) changes.
 */

const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'

/**
 * Split hero: words on the left on their own quiet ground, the painting on the
 * right as an actual picture. The old hero laid a frosted panel over a
 * blurred, washed-out painting, which hid the one thing on the page made for
 * it. Same paintings, same alt text, same preload (it is still the LCP image).
 *
 * `aside` replaces the painting's foreground (the trivia page puts the game
 * there, sitting on the game-night painting).
 */
export function HubHero({
  art, alt, eyebrow, title, sub, children, aside, artPosition = 'center',
}: {
  art: string
  alt: string
  eyebrow?: React.ReactNode
  title: React.ReactNode
  sub?: React.ReactNode
  children?: React.ReactNode
  aside?: React.ReactNode
  artPosition?: string
}) {
  const src = `${CDN}/home/hero-${art}-1536.webp`
  const set = [512, 768, 1152, 1536].map(w => `${CDN}/home/hero-${art}-${w}.webp ${w}w`).join(', ')
  return (
    <>
      <link rel="preload" as="image" href={src} imageSrcSet={set}
            imageSizes="(min-width: 960px) 50vw, 100vw" fetchPriority="high" />
      <section className={`hb-hero${aside ? ' has-aside' : ''}`}>
        <div className="hb-hero-text">
          {eyebrow && <p className="hb-eyebrow">{eyebrow}</p>}
          <h1 className="hv-h1 hb-h1">{title}</h1>
          {sub && <p className="hb-lede">{sub}</p>}
          {children}
        </div>
        <div className="hb-hero-art">
          <img src={src} srcSet={set} sizes="(min-width: 960px) 50vw, 100vw" alt={alt}
               width={1536} height={1024} fetchPriority="high"
               style={{ objectPosition: artPosition }} />
          {aside && <div className="hb-hero-aside">{aside}</div>}
        </div>
      </section>
    </>
  )
}

/** Section heading. Left-aligned, so a page reads like a page rather than a
 *  stack of centred banners. `as` lets a heading keep the level it had live. */
export function HubHead({
  eyebrow, title, sub, action, center = false,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  sub?: React.ReactNode
  action?: React.ReactNode
  center?: boolean
}) {
  return (
    <div className={`hb-head${center ? ' is-center' : ''}${action ? ' has-action' : ''}`}>
      <div>
        {eyebrow && <p className="hb-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {sub && <p className="hb-head-sub">{sub}</p>}
      </div>
      {action && <div className="hb-head-action">{action}</div>}
    </div>
  )
}
