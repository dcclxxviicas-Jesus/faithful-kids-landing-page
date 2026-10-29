// Data for /printables/books-of-the-bible.
// Target: "books of the bible printable" — 1,000/mo ads, 402/mo clickstream,
// KD 0 (DataForSEO Oct 29, 2026); "books of the bible bookmark" 390/mo KD 0.
// SERP is Pinterest pins, Etsy and worksheet blogs — no strong incumbent.
// GSC already shows "66 books of the bible coloring pages pdf" at pos 11
// with no page to land on.
//
// Chapter counts are the standard Protestant (66-book) canon figures.
// Checks: 39 + 27 = 66 books; 929 + 260 = 1,189 chapters. The page derives
// every stated count from these arrays — never hardcode 66/39/27 in copy.

export type BibleBook = { name: string; chapters: number; triviaSlug: string }
export type BookGroup = { name: string; blurb: string; books: BibleBook[] }

const b = (name: string, chapters: number): BibleBook => ({
  name,
  chapters,
  triviaSlug:
    name.toLowerCase().replace(/ /g, '-') + '-bible-trivia',
})

export const OT_GROUPS: BookGroup[] = [
  {
    name: 'The Law',
    blurb: 'Creation, the promise to Abraham, the Exodus, and the covenant at Sinai.',
    books: [b('Genesis', 50), b('Exodus', 40), b('Leviticus', 27), b('Numbers', 36), b('Deuteronomy', 34)],
  },
  {
    name: 'History',
    blurb: 'Israel enters the land, asks for kings, splits, falls, and comes home again.',
    books: [
      b('Joshua', 24), b('Judges', 21), b('Ruth', 4), b('1 Samuel', 31), b('2 Samuel', 24),
      b('1 Kings', 22), b('2 Kings', 25), b('1 Chronicles', 29), b('2 Chronicles', 36),
      b('Ezra', 10), b('Nehemiah', 13), b('Esther', 10),
    ],
  },
  {
    name: 'Poetry & Wisdom',
    blurb: 'Songs, prayers, and hard-won wisdom for everyday life.',
    books: [b('Job', 42), b('Psalms', 150), b('Proverbs', 31), b('Ecclesiastes', 12), b('Song of Solomon', 8)],
  },
  {
    name: 'Major Prophets',
    blurb: '"Major" means longer, not more important — the big prophetic books.',
    books: [b('Isaiah', 66), b('Jeremiah', 52), b('Lamentations', 5), b('Ezekiel', 48), b('Daniel', 12)],
  },
  {
    name: 'Minor Prophets',
    blurb: 'Twelve short books with the same message: come back to God.',
    books: [
      b('Hosea', 14), b('Joel', 3), b('Amos', 9), b('Obadiah', 1), b('Jonah', 4), b('Micah', 7),
      b('Nahum', 3), b('Habakkuk', 3), b('Zephaniah', 3), b('Haggai', 2), b('Zechariah', 14), b('Malachi', 4),
    ],
  },
]

export const NT_GROUPS: BookGroup[] = [
  {
    name: 'The Gospels',
    blurb: 'The life of Jesus told four times, from four points of view.',
    books: [b('Matthew', 28), b('Mark', 16), b('Luke', 24), b('John', 21)],
  },
  {
    name: 'History',
    blurb: 'The church is born and the good news spreads from Jerusalem to Rome.',
    books: [b('Acts', 28)],
  },
  {
    name: "Paul's Letters",
    blurb: 'Letters to young churches and young leaders, longest first.',
    books: [
      b('Romans', 16), b('1 Corinthians', 16), b('2 Corinthians', 13), b('Galatians', 6),
      b('Ephesians', 6), b('Philippians', 4), b('Colossians', 4), b('1 Thessalonians', 5),
      b('2 Thessalonians', 3), b('1 Timothy', 6), b('2 Timothy', 4), b('Titus', 3), b('Philemon', 1),
    ],
  },
  {
    name: 'General Letters',
    blurb: 'Letters to all believers everywhere, by James, Peter, John, Jude and one unnamed author.',
    books: [
      b('Hebrews', 13), b('James', 5), b('1 Peter', 5), b('2 Peter', 3),
      b('1 John', 5), b('2 John', 1), b('3 John', 1), b('Jude', 1),
    ],
  },
  {
    name: 'Prophecy',
    blurb: 'John’s vision of the end of the story: everything made new.',
    books: [b('Revelation', 22)],
  },
]

export const OT_BOOKS = OT_GROUPS.flatMap(g => g.books)
export const NT_BOOKS = NT_GROUPS.flatMap(g => g.books)
export const ALL_BOOKS = [...OT_BOOKS, ...NT_BOOKS]
export const OT_CHAPTERS = OT_BOOKS.reduce((n, x) => n + x.chapters, 0)
export const NT_CHAPTERS = NT_BOOKS.reduce((n, x) => n + x.chapters, 0)

// Canon sanity — these throw at build time if the data drifts.
if (OT_BOOKS.length !== 39 || NT_BOOKS.length !== 27) {
  throw new Error(`books-of-the-bible: expected 39+27 books, got ${OT_BOOKS.length}+${NT_BOOKS.length}`)
}
if (OT_CHAPTERS !== 929 || NT_CHAPTERS !== 260) {
  throw new Error(`books-of-the-bible: chapter totals drifted (${OT_CHAPTERS}/${NT_CHAPTERS}, expected 929/260)`)
}
