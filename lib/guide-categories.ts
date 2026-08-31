// Guide category taxonomy — shared by the blog index (client) and the
// /blog/topics/[category] hub pages (server). Pure module: no fs imports.

export interface GuideCategory {
  name: string // display name (matches the original BlogGrid filter labels)
  slug: string // URL segment under /blog/topics/
  title: string // hub page H1 / <title>
  description: string // hub page meta description (<158 chars)
  intro: string // hub page intro paragraph
}

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    name: 'Bible Verses',
    slug: 'bible-verses-for-kids',
    title: 'Bible Verses for Kids',
    description:
      'Bible verses for kids collected by topic and occasion -- courage, kindness, bedtime, graduation, and more, each explained simply for children.',
    intro:
      'Every verse collection on this page is chosen for kids -- short enough to memorize, explained in plain words, and organized by the moments families actually face: scared nights, first days of school, graduations, and everyday character building.',
  },
  {
    name: 'Bible Characters',
    slug: 'bible-characters-for-kids',
    title: 'Bible Characters for Kids',
    description:
      'Who was Moses? Who was Esther? Kid-friendly profiles of the Bible’s most important people -- their stories, their flaws, and what kids can learn.',
    intro:
      'These profiles walk kids through the life of each major Bible character stage by stage -- with the scripture references, the honest flaws, and a clear takeaway for every age.',
  },
  {
    name: 'How to Explain',
    slug: 'explaining-faith-to-kids',
    title: 'Explaining Faith to Kids',
    description:
      'How to explain God, prayer, Easter, communion, and other big faith topics to a child -- age-by-age scripts and practical tips for parents.',
    intro:
      'Big questions deserve better than "because the Bible says so." Each guide here breaks a faith topic down age band by age band, with sample wording you can actually use.',
  },
  {
    name: 'Bible Themes',
    slug: 'bible-stories-by-theme',
    title: 'Bible Stories by Theme',
    description:
      'Bible stories for kids organized by virtue and theme -- courage, kindness, patience, forgiveness, self-control, and more, retold simply.',
    intro:
      'Teaching a specific virtue this week? Each roundup collects the Bible stories that teach it best, retold at kid level with the verse each one comes from.',
  },
  {
    name: 'By Age',
    slug: 'bible-stories-by-age',
    title: 'Bible Stories by Age',
    description:
      'The best Bible stories for toddlers, preschoolers, 5-year-olds, 10-year-olds, and teens -- age-matched picks with reading tips for each stage.',
    intro:
      'A story that lands with a 4-year-old bores a 10-year-old, and vice versa. These guides match the right stories -- and the right way to tell them -- to each age.',
  },
  {
    name: 'Screen Time',
    slug: 'screen-time',
    title: 'Screen Time and Christian Kids',
    description:
      'What the research says about kids and screens, how Christian families set healthy limits, and faith-based alternatives to endless YouTube.',
    intro:
      'Screens are not the enemy -- unguided screens are. These guides cover what the research actually says, how to set limits that stick, and what to point kids toward instead.',
  },
  {
    name: 'App Reviews',
    slug: 'christian-app-reviews',
    title: 'Christian App and Media Reviews',
    description:
      'Honest reviews and comparisons of Bible apps, Christian cartoons, and faith-based media for kids -- what each does well and who it fits.',
    intro:
      'Side-by-side comparisons and honest reviews of the Bible apps, shows, and platforms families ask about most -- including where each one falls short.',
  },
  {
    name: 'Teaching',
    slug: 'teaching-the-bible',
    title: 'Teaching the Bible to Kids',
    description:
      'Sunday school lesson plans, homeschool Bible resources, memory verse strategies, and discussion questions for teaching kids the Bible.',
    intro:
      'For Sunday school teachers, homeschool parents, and small-group leaders: ready-to-use lesson plans, memory strategies, and discussion questions that work with real kids.',
  },
  {
    name: 'Seasonal',
    slug: 'seasonal',
    title: 'Seasonal and Holiday Guides',
    description:
      'Christmas, Easter, Advent, Lent, and holiday guides for Christian families -- stories, activities, and traditions that keep Christ at the center.',
    intro:
      'Every season is a teaching moment. These guides pair each holiday with the stories, activities, and traditions that keep its meaning in front of your kids.',
  },
  {
    name: 'Printables',
    slug: 'bible-printables',
    title: 'Free Bible Printables for Kids',
    description:
      'Printable Bible resources for families and classrooms -- coloring pages, verse cards, word searches, bingo, journaling and study templates.',
    intro:
      'Everything here is built to be printed and used: coloring page ideas by story, memory verse cards, word searches, bingo sets, and study templates. Our three free downloads live on the printables page.',
  },
  {
    name: 'Activities',
    slug: 'bible-games-and-activities',
    title: 'Bible Games and Activities',
    description:
      'Bible trivia, charades, jokes, crafts, word searches, and games for kids -- ready-to-play activities for family night, class, and car rides.',
    intro:
      'Trivia packs, charades lists, crafts, jokes, and zero-prep games -- everything here is ready to run tonight, with answers and instructions included.',
  },
  {
    name: 'Family',
    slug: 'family-devotions',
    title: 'Family Devotions and Routines',
    description:
      'Daily devotions, 30-day challenges, and family Bible time routines -- simple structures that make faith a daily habit at home.',
    intro:
      'The families that keep faith daily are not the most disciplined -- they have the simplest routines. These guides give you structures that survive real weeknights.',
  },
  {
    name: 'Parenting',
    slug: 'christian-parenting',
    title: 'Christian Parenting Guides',
    description:
      'Raising godly kids in a distracted world -- praying with your children, making church fun, and biblical parenting principles that hold up.',
    intro:
      'Practical, grace-first guides for the long game of Christian parenting -- from praying with your kids to keeping them engaged with church.',
  },
  {
    name: 'Bible Books',
    slug: 'books-of-the-bible',
    title: 'Books of the Bible for Kids',
    description:
      'The books of the Bible explained for kids -- what each book covers, its key stories, and kid-friendly summaries from Genesis to Revelation.',
    intro:
      'From Genesis to Revelation: what each book of the Bible is about, its stories kids should know, and how the whole library fits together.',
  },
  {
    name: 'Life Questions',
    slug: 'big-questions-kids-ask',
    title: 'Big Questions Kids Ask',
    description:
      'Why do bad things happen? What happens when we die? Biblical, age-appropriate answers to the hardest questions kids ask their parents.',
    intro:
      'Kids ask the hardest questions at bedtime. These guides give you biblical, age-appropriate answers for the moments you cannot improvise.',
  },
  {
    name: 'Guides',
    slug: 'more-guides',
    title: 'More Family Faith Guides',
    description:
      'More guides for Christian families -- practical faith resources for parents and kids that do not fit neatly anywhere else.',
    intro:
      'The rest of the library: practical faith guides for families that span more than one topic.',
  },
]

const BY_NAME = new Map(GUIDE_CATEGORIES.map(c => [c.name, c]))
const BY_SLUG = new Map(GUIDE_CATEGORIES.map(c => [c.slug, c]))

export function getCategoryBySlug(slug: string): GuideCategory | undefined {
  return BY_SLUG.get(slug)
}

export function getCategoryByName(name: string): GuideCategory | undefined {
  return BY_NAME.get(name)
}

// Categorize guide posts by slug pattern (moved from BlogGrid.tsx so the
// hub pages and the blog index share one source of truth)
export function getGuideCategory(slug: string): string {
  if (slug.startsWith('bible-verses-') || slug.startsWith('short-bible-verses') || slug.startsWith('goodnight-bible-verses')) return 'Bible Verses'
  if (slug.startsWith('who-was-')) return 'Bible Characters'
  if (slug.startsWith('how-to-explain-')) return 'How to Explain'
  if (slug.startsWith('bible-stories-about-') || slug === 'bible-stories-with-moral-lessons-for-kids') return 'Bible Themes'
  if (slug.startsWith('bible-stories-for-') || slug === 'best-bible-stories-for-kids') return 'By Age'
  if (slug.includes('screen-time') || slug.includes('digital-stewardship') || slug.includes('christian-alternatives')) return 'Screen Time'
  // "Where to watch X" / streaming posts belong with the app and service
  // reviews, not the generic Guides catch-all. FIRST MATCH WINS, so this sits
  // immediately above the -vs- / -review rule it belongs with.
  if (slug.startsWith('where-to-watch') || slug.includes('streaming') || slug.includes('adventures-in-odyssey')) return 'App Reviews'
  if (slug.includes('-vs-') || slug.includes('best-bible-app') || slug.includes('free-bible-apps') || slug.includes('best-educational') || slug.includes('best-bible-apps') || slug.endsWith('-review')) return 'App Reviews'
  if (slug.includes('sunday-school') || slug.includes('homeschool') || slug.includes('lesson-plan') || slug.includes('object-lesson') || slug.includes('memory-verse') || slug.includes('bible-study-group') || slug.includes('discussion-questions') || slug.includes('curriculum') || slug.includes('childrens-church') || slug.includes('teaching-the-bible') || slug.includes('teacher-tips')) return 'Teaching'
  if (slug.includes('holy-week') || slug.includes('advent') || slug.includes('thanksgiving') || slug.includes('christmas') || slug.includes('easter') || slug.includes('lent') || slug.includes('new-year') || slug.includes('back-to-school') || slug.includes('summer')) return 'Seasonal'
  if (slug.includes('printable') || slug.includes('coloring')) return 'Printables'
  if (slug.includes('trivia') || slug.includes('riddles') || slug.includes('jokes') || slug.includes('games') || slug.includes('word-search') || slug.includes('coloring') || slug.includes('crafts') || slug.includes('fun-facts')) return 'Activities'
  if (slug.includes('family') || slug.includes('devotions') || slug.includes('bible-time') || slug.includes('30-day') || slug.includes('dinner')) return 'Family'
  if (slug.includes('parenting') || slug.includes('godly-kids') || slug.includes('pray-with') || slug.includes('church-fun') || slug.includes('podcast') || slug.includes('when-should')) return 'Parenting'
  if (slug.includes('book-of-') || slug.includes('books-of-') || slug.includes('commandments') || slug.includes('lords-prayer') || slug.includes('beatitudes') || slug.includes('fruit-of-the-spirit') || slug.includes('gospel')) return 'Bible Books'
  if (slug.includes('salvation') || slug.includes('death') || slug.includes('bad-things') || slug.includes('bullying') || slug.includes('divorce') || slug.includes('sickness') || slug.includes('anxious') || slug.includes('healing')) return 'Life Questions'
  return 'Guides'
}
