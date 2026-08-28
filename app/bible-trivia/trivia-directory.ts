// Directory of every trivia page on the site, rendered on /bible-trivia below
// the game. The hub carries the head term; these links hand a visitor (and
// link equity) to the specific page they actually want. Book slugs are
// derived from the canonical names — check-links.py verifies every one
// resolves at build time.

export interface TriviaLink {
  title: string
  href: string
  note?: string
}

export const BY_AGE: TriviaLink[] = [
  { title: 'Bible Trivia for Kids', href: '/blog/bible-trivia-for-kids', note: '75 questions in easy, medium, and hard rounds — with a free printable PDF' },
  { title: 'Bible Trivia for Teens', href: '/blog/bible-trivia-for-teens', note: 'Harder rounds built for youth group and lock-ins' },
  { title: 'Bible Trivia for Adults', href: '/blog/bible-trivia-for-adults', note: '50 hard questions with a warm-up round that humbles the confident — free PDF included' },
  { title: 'Bible Trivia for Youth Groups', href: '/blog/bible-trivia-for-youth', note: 'Formats and questions sized for a whole youth room' },
  { title: 'Family Bible Trivia Night', href: '/blog/family-bible-trivia-night', note: 'Formats, scoring systems, and prizes for a repeatable tradition' },
]

export const BY_FORMAT: TriviaLink[] = [
  { title: '100 Bible Trivia Questions and Answers', href: '/blog/100-bible-trivia-questions-and-answers', note: 'The master list, Genesis to Revelation, in four difficulty tiers' },
  { title: 'Easy Bible Trivia Questions', href: '/blog/easy-bible-trivia-questions', note: 'One-word answers for the youngest players' },
  { title: 'Multiple Choice Bible Trivia', href: '/blog/bible-trivia-multiple-choice', note: 'Pick-from-four format that keeps shy kids playing' },
  { title: 'Old Testament Trivia', href: '/blog/old-testament-bible-trivia-for-kids', note: 'Genesis through Malachi in one question bank' },
  { title: 'New Testament Trivia', href: '/blog/new-testament-bible-trivia-for-kids', note: 'The Gospels through Revelation' },
  { title: 'Printable Trivia Pack', href: '/printables/bible-trivia-pack', note: 'All 100 questions formatted to print, answer key in the back' },
]

export const SEASONAL: TriviaLink[] = [
  { title: 'Christmas Bible Trivia', href: '/blog/christmas-bible-trivia', note: 'The nativity story, tested' },
  { title: 'Christmas Trivia for Kids', href: '/blog/christmas-bible-trivia-for-kids', note: 'The kid-sized Christmas round' },
  { title: 'Easter Bible Trivia for Kids', href: '/blog/easter-bible-trivia-for-kids', note: 'Holy Week and the resurrection' },
  { title: 'Thanksgiving Bible Trivia', href: '/blog/thanksgiving-bible-trivia', note: 'Gratitude and harvest, from the text' },
]

const OT_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
  'Malachi',
]

const NT_BOOKS = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
]

const bookLink = (name: string): TriviaLink => ({
  title: name,
  href: `/blog/${name.toLowerCase().replace(/ /g, '-')}-bible-trivia`,
})

export const OT_TRIVIA: TriviaLink[] = OT_BOOKS.map(bookLink)
export const NT_TRIVIA: TriviaLink[] = NT_BOOKS.map(bookLink)

export const ALL_TRIVIA_LINKS: TriviaLink[] = [
  ...BY_AGE, ...BY_FORMAT, ...SEASONAL, ...OT_TRIVIA, ...NT_TRIVIA,
]
