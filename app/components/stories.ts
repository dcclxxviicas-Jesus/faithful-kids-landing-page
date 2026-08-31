// The sample lessons used across the marketing site. One definition, so the
// homepage and /homeschool can never drift apart on which videos they show or
// which poster belongs to which.
//
// Posters are real frames pulled from each lesson and chosen for brightness and
// detail — without them these videos paint black until played, because they
// ship preload="none".
export const CDN = 'https://d3g07v1w0lehiv.cloudfront.net'

export type Story = {
  src: string
  loopSrc?: string
  poster: string
  title: string
  badge: string
  series: string
  age: string
  blurb: string
}

export const STORIES: Story[] = [
  {
    src: `${CDN}/bible/birth-of-jesus-series/01-an-angel-visits-mary/lesson-video.mp4`,
    // A 10s, 371KB muted clip for the autoplaying hero. The full lesson is
    // 28.5MB; streaming it as a decorative background loop was 91% of the
    // homepage's weight and cost ~25 Lighthouse points on mobile.
    loopSrc: `${CDN}/hero-loops/an-angel-visits-mary-loop.mp4`,
    poster: `${CDN}/video-posters/an-angel-visits-mary.webp`,
    title: 'An Angel Visits Mary',
    badge: 'Birth of Jesus',
    series: 'Birth of Jesus',
    age: 'Ages 5+',
    blurb: 'The angel Gabriel brings Mary an extraordinary message, and she answers with faith.',
  },
  {
    src: `${CDN}/bible/genesis-series/01-in-the-beginning-creation/lesson-video.mp4`,
    poster: `${CDN}/video-posters/in-the-beginning-creation.webp`,
    title: 'In the Beginning: Creation',
    badge: 'Genesis',
    series: 'Genesis',
    age: 'Ages 5+',
    blurb: 'Day by day, God speaks the world into being — light, sky, sea, creatures, and people.',
  },
  {
    src: `${CDN}/bible/exodus-series/01-a-baby-in-a-basket/lesson-video.mp4`,
    poster: `${CDN}/video-posters/a-baby-in-a-basket.webp`,
    title: 'A Baby in a Basket',
    badge: 'Exodus',
    series: 'Exodus',
    age: 'Ages 5+',
    blurb: 'Moses is hidden in a basket on the Nile, and his sister watches to see who will find him.',
  },
  {
    src: `${CDN}/bible/genesis-series/04-noah-and-the-great-flood/lesson-video.mp4`,
    poster: `${CDN}/video-posters/noah-and-the-great-flood.webp`,
    title: 'Noah & the Great Flood',
    badge: 'Genesis',
    series: 'Genesis',
    age: 'Ages 5+',
    blurb: 'Noah trusts God, builds the ark, and watches a rainbow become a promise.',
  },
]
