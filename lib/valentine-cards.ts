// Data for /printables/valentine-bible-verse-cards.
// Feb cluster verified Oct 13 + 29, 2026 (DataForSEO): "valentines bible
// verses" 4,400/mo ads KD 0 (annualized — Feb peak runs higher), and the
// winning page-1 shape on the kids variant is PRINTABLE VERSE CARDS
// (notconsumed #1, rachelwojo #2, ministry-to-children #5), not articles.
//
// Verse texts are short, translation-common fragments quoted with their
// reference. Art slugs must match generate-valentine-cards.py at project
// root (images at CDN valentine-cards/<slug>.png — line art, colorable).

export type ValentineCard = { slug: string; verse: string; ref: string }

export const VALENTINE_CARDS: ValentineCard[] = [
  { slug: 'love-one-another', verse: 'Love one another.', ref: 'John 13:34' },
  { slug: 'love-is-patient', verse: 'Love is patient, love is kind.', ref: '1 Corinthians 13:4' },
  { slug: 'first-loved-us', verse: 'We love because he first loved us.', ref: '1 John 4:19' },
  { slug: 'do-everything-in-love', verse: 'Do everything in love.', ref: '1 Corinthians 16:14' },
  { slug: 'friend-loves', verse: 'A friend loves at all times.', ref: 'Proverbs 17:17' },
  { slug: 'love-comes-from-god', verse: 'Let us love one another, for love comes from God.', ref: '1 John 4:7' },
  { slug: 'god-so-loved', verse: 'For God so loved the world…', ref: 'John 3:16' },
  { slug: 'his-love-endures', verse: 'Give thanks to the Lord, for he is good. His love endures forever.', ref: 'Psalm 136:1' },
  { slug: 'be-kind', verse: 'Be kind and compassionate to one another.', ref: 'Ephesians 4:32' },
  { slug: 'love-your-neighbor', verse: 'Love your neighbor as yourself.', ref: 'Mark 12:31' },
  { slug: 'great-love-lavished', verse: 'See what great love the Father has lavished on us!', ref: '1 John 3:1' },
  { slug: 'faith-hope-love', verse: 'And now these three remain: faith, hope and love. But the greatest of these is love.', ref: '1 Corinthians 13:13' },
]
