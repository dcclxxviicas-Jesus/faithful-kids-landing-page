/* Labels and types for /christian-apps, safe to import from client components
 * (no listing data here, so nothing heavy ships to the browser). */

export type Category =
  | 'bible-stories' | 'video' | 'games' | 'music' | 'audio-stories'
  | 'prayer-devotional' | 'scripture-memory' | 'catholic' | 'parent-tools' | 'websites'
  | 'bible' | 'bible-study' | 'audio' | 'church' | 'accountability'
  | 'readings' | 'learning'

export const CATEGORIES: { key: Category; label: string; blurb: string }[] = [
  { key: 'bible', label: 'Bible apps', blurb: 'Bible reading apps and audio Bibles' },
  { key: 'bible-study', label: 'Bible study', blurb: 'Study Bibles, commentaries and original-language tools' },
  { key: 'bible-stories', label: 'Bible stories', blurb: 'Read-aloud and interactive Bible story apps' },
  { key: 'video', label: 'Video & shows', blurb: 'Christian shows, films and video lessons' },
  { key: 'games', label: 'Games & trivia', blurb: 'Bible games, quizzes and play' },
  { key: 'music', label: 'Music', blurb: 'Worship and Scripture songs for kids' },
  { key: 'audio-stories', label: 'Audio stories', blurb: 'Audio dramas and listen-along stories' },
  { key: 'audio', label: 'Sermons & teaching', blurb: 'Sermons, teaching and audio devotionals' },
  { key: 'prayer-devotional', label: 'Prayer & devotionals', blurb: 'Daily devotions, prayer and Bible reading' },
  { key: 'scripture-memory', label: 'Scripture memory', blurb: 'Memorize verses with games and songs' },
  { key: 'catholic', label: 'Catholic', blurb: 'Apps made for Catholic families' },
  { key: 'readings', label: 'Daily readings', blurb: 'Mass readings, missals, the Liturgy of the Hours and liturgical calendars' },
  { key: 'learning', label: 'Learn the faith', blurb: 'Lessons and answers about what the Church teaches' },
  { key: 'parent-tools', label: 'For parents', blurb: 'Christian parenting and family tools' },
  { key: 'church', label: 'Church', blurb: 'Church and community apps' },
  { key: 'accountability', label: 'Accountability', blurb: 'Christian accountability and filtering apps' },
  { key: 'websites', label: 'Websites', blurb: 'Christian websites for kids and families' },
]

export const AGE_GROUPS: { key: AgeGroup; label: string }[] = [
  { key: 'toddler', label: 'Toddlers (0-4)' },
  { key: 'young', label: 'Ages 5-8' },
  { key: 'older', label: 'Ages 9-12' },
  { key: 'teen', label: 'Teens' },
  { key: 'family', label: 'Whole family' },
]
export type AgeGroup = 'toddler' | 'young' | 'older' | 'teen' | 'family'

export type PriceModel = 'free' | 'free-with-ads' | 'freemium' | 'subscription' | 'paid'
export const PRICE_LABEL: Record<PriceModel, string> = {
  free: 'Free',
  'free-with-ads': 'Free with ads',
  freemium: 'Free with paid extras',
  subscription: 'Subscription',
  paid: 'Paid',
}

export interface Listing {
  slug: string
  name: string
  maker: string | null
  category: Category
  ages: string
  agesSource: string
  ageGroups: AgeGroup[]
  priceModel: PriceModel
  price: string
  platforms: { ios?: string; android?: string; web?: string }
  ads: 'yes' | 'no' | 'unknown'
  updated: string | null
  denomination: string | null
  description: string
  goodFor: string
  worthKnowing: string
  website: string | null
  checkedOn: string
  sources: string[]
  kind: 'app' | 'website'
  icon?: string
  /** Which hub lists it: /christian-apps (kids), /best-christian-apps (adults), or both. */
  audience: 'kids' | 'adults' | 'both'
  /** Category to use on the adults hub when it differs (e.g. The Chosen: video). */
  adultCategory?: Category
  /** true for approved submissions: the maker wrote the description. */
  submitted?: boolean
}

export function categoryLabel(c: Category): string {
  return CATEGORIES.find(x => x.key === c)?.label || 'Apps'
}
