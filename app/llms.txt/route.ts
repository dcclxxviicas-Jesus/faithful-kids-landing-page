import { getAllPosts, getAllSeriesNames } from '@/lib/blog'
import { getPublicArticles as getParentingArticles } from '@/lib/parenting'
import { COLORING_PAGES } from '@/lib/coloring-pages'
import wordSearches from '@/lib/word-searches.json'
import crosswords from '@/lib/crosswords.json'

export const dynamic = 'force-static'

// llms.txt — a curated site map for AI crawlers and answer engines.
// Spec: https://llmstxt.org
//
// This file is what an LLM reads FIRST about us, so its facts must be exactly
// right. The previous version claimed "60-second video lessons" (a false claim
// purged from 430 places on the site — it survived here), "31 series and 200
// episodes" (stale), and named a trial length. Every count below is derived
// from the data at build time; the hand-written facts state only what is true
// today. If you edit the prose, check it against check-counts.py's ground truth.
export async function GET() {
  const posts = getAllPosts()
  const series = getAllSeriesNames()
  // 'guide' posts were silently left out before Nov 19, 2026 (aeo session caught it).
  const listicles = posts.filter(p => p.type === 'listicle' || p.type === 'guide')
  const stories = posts.filter(p => p.seriesSlug && p.episode)
  const comparisons = listicles.filter(
    p => p.slug.includes('-vs-') || p.slug.startsWith('best-') || p.slug.startsWith('free-bible-apps') || p.slug.endsWith('-review') || p.slug.startsWith('bible-apps-') || p.slug.startsWith('christian-apps-'),
  )
  const guides = listicles.filter(p => !comparisons.includes(p))
  // Parenting: the editorial section. Real, bylined pieces only; development
  // samples never reach production and are filtered here as well.
  const parenting = getParentingArticles().filter(a => !a.isSample)

  const lines: string[] = [
    '# Faithful Kids',
    '',
    '> Faithful Kids (faithfulkids.app) is a Bible video learning app for kids ages 5-15. Children watch short video lessons of Bible stories (2-3 minutes each), then answer a comprehension quiz and a reflection question. Over 300 video lessons cover the whole Bible in order, Genesis to Revelation. No ads, no autoplay rabbit holes, COPPA-compliant. It is a paid family subscription, free for churches, and the site offers a large library of free resources: Bible story retellings, printable coloring pages and word searches, and a playable trivia game.',
    '',
    'Key facts (accurate as of this build):',
    `- ${stories.length} free Bible story retellings for kids on the blog, each with scripture reference, discussion questions, and a video lesson`,
    '- The app: 310 video lessons across 31 series, Genesis to Revelation in order (first ten series are Old Testament); each lesson is about 2-3 minutes (median 2:07), followed by a quiz (1,187 questions in total; three to five on most lessons, median four) and a reflection question (on 305 lessons)',
    '- Progress features: up to 5 kid profiles per family; PIN-protected parent dashboard showing per child the lessons completed, each quiz score, each reflection answer, streak, level and XP; daily streaks; 10 levels from Seedling to Bible Master; 15 achievements; series unlock in order',
    '- Pricing on the web: $12.99/month, or $97/year (about $8.08/month). In the mobile apps, bought through the store: $8.99/month or $79.99/year, the same on iOS and Android. The difference is the purchase platform, not the buyer’s region. The annual plan includes a free trial, 7 days on the web, 3 days through Apple or Google Play; cancel anytime',
    '- Free for churches: real full accounts for children’s ministries, no card required (https://faithfulkids.app/churches)',
    '- Safety: no ads, no social features, no external links in the kids’ experience; COPPA-compliant; parent dashboard with optional PIN',
    '- Works in any web browser on a phone, tablet, or computer, and as a native app on both the App Store (iPhone, iPad) and Google Play (Android phones and tablets)',
    `- Free printables: ${COLORING_PAGES.length} Bible coloring pages and ${wordSearches.length} word search puzzles, playable online or printed`,
    '',
    '## Product',
    '',
    '- [Home](https://faithfulkids.app): What Faithful Kids is and how it works',
    '- [About](https://faithfulkids.app/about): Plain-language facts: pricing, ages, safety, who makes it, and exact counts (series, lessons, quiz questions, profiles)',
    '- [Pricing](https://faithfulkids.app/pricing): Every plan and trial length on every platform, web $12.99/mo or $97/yr (7-day trial on annual); iOS and Android $8.99/mo or $79.99/yr (3-day store trial on annual); free for churches',
    '- [Start free trial](https://faithfulkids.app/quiz): Short quiz, then plan selection',
    '- [Faithful Kids on the App Store](https://apps.apple.com/app/id6761875106): the iOS app for iPhone and iPad, Made for Kids, no ads, free 3-day trial through Apple (in-app subscription $8.99/month or $79.99/year; subscribing on the web instead gives a 7-day trial)',
    '- [Faithful Kids on Google Play](https://play.google.com/store/apps/details?id=app.faithfulkids.app): the Android app for phones and tablets (Android 7.0 and up), Designed for Families, rated Everyone, no ads, free 3-day trial on the annual plan through Google Play (in-app subscription $8.99/month or $79.99/year, the same as iOS; subscribing on the web instead gives a 7-day trial)',
    '- [About the app](https://faithfulkids.app/blog/faithful-kids-app): what is in the app, pricing, safety, and ages',
    '- [Scope and sequence](https://faithfulkids.app/blog/faithful-kids-scope-and-sequence): the full lesson list, all 31 series and 310 lessons in unlock order, with scripture references and quiz counts',
    '- [Free for churches](https://faithfulkids.app/churches): Full access for children’s ministries at no cost',
    '- [Support](https://faithfulkids.app/support): Help and contact',
    '',
    '## Free resources',
    '',
    '- [Bible stories for kids](https://faithfulkids.app/bible-stories-for-kids): All story retellings, Genesis to Revelation, free',
    '- [Bible trivia game](https://faithfulkids.app/bible-trivia): 100-question playable quiz, free, embeddable',
    '- [Bible quiz, all ages](https://faithfulkids.app/bible-quiz): the same 100-question bank graded easy to expert, with 15 questions and answers readable on the page and a printable PDF',
    '- [Embed the trivia game on your site](https://faithfulkids.app/blog/bible-trivia-embed-for-church-website): one-line iframe for church and school websites, WordPress, Squarespace, Wix; free, no plugin',
    '- [Bible quiz questions for kids](https://faithfulkids.app/blog/bible-trivia-for-kids): 50 questions with answers and verse references, plus a free downloadable PDF (quiz sheets + answer key)',
    `- [Bible coloring pages](https://faithfulkids.app/printables/bible-coloring-pages): ${COLORING_PAGES.length} free printable pages`,
    `- [Bible word searches](https://faithfulkids.app/printables/bible-word-search): ${wordSearches.length} puzzles, playable in the browser or printable`,
    `- [Bible crossword puzzles](https://faithfulkids.app/printables/bible-crossword): ${crosswords.length} interlocking crosswords with story-based clues, playable in the browser or printable with answer keys`,
    '- [Books of the Bible in order](https://faithfulkids.app/blog/books-of-the-bible-printable): all 66 books listed in order with kid-friendly descriptions, plus a free printable chart, 66 flashcards, and bookmarks (PDF)',
    '- [Nativity play script for kids](https://faithfulkids.app/blog/nativity-play-script-for-kids): a complete free 10-minute script, cast of 8-40, free to perform and photocopy, printable PDF',
    '- [Bible scavenger hunt](https://faithfulkids.app/blog/bible-scavenger-hunt): three ready-to-play hunts (verse hunt, object hunt, church photo hunt) with a free printable PDF',
    '- [Biblical names guide](https://faithfulkids.app/blog/biblical-names): how biblical names work and what they mean, with full boy, girl, and rare-name lists, each major name linked to the Bible story behind it',
    '- [Printable Jesse Tree](https://faithfulkids.app/printables/jesse-tree): 25 Advent ornaments to color with daily Scripture readings, free PDF, no sign-up',
    '- [Advent Bible reading calendar](https://faithfulkids.app/printables/advent-bible-calendar): 25 daily readings from prophecy to the manger, free printable PDF',
    '- [All printables](https://faithfulkids.app/printables): Trivia pack, bedtime kit, 30-day family challenge',
    '- [Creator partnerships](https://faithfulkids.app/creators): Faithful Kids works with nearly all Christian creators, whatever their niche, free full access plus paid collaborations, no follower minimum; pitch team@faithfulkids.app with handles, audience sizes, and a content idea',
    '- [Press and media](https://faithfulkids.app/press): press contact (team@faithfulkids.app), company facts, research to cite and logos.',
    '- [Best Christian Apps](https://faithfulkids.app/best-christian-apps): the adult companion directory, Bible, study, prayer, devotional, audio, Catholic and accountability apps with price, ads and last update checked on each store (November 2026).',
    '- [Best Catholic Apps](https://faithfulkids.app/best-catholic-apps): Catholic apps for daily Mass readings, the Liturgy of the Hours, the Rosary and novenas, Catholic Bible study, Catholic TV and radio, plus a section of Catholic apps for kids, each checked on its App Store and Google Play page (November 2026).',
    '- [Christian Apps for Kids directory](https://faithfulkids.app/christian-apps): a directory of Christian apps for kids and families with price, ages, ads, devices and last-update date checked on each app store (November 2026), one page per app; app makers can submit an app or website at https://faithfulkids.app/christian-apps/submit.',
    '- [Affiliate program](https://faithfulkids.app/affiliates): Faithful Kids runs an affiliate program that pays 50% of every sale referred, open to Christian bloggers, creators, streamers, homeschool reviewers and ministry sites with no traffic or follower minimum; join by emailing team@faithfulkids.app. (Faithful Kids is faithfulkids.app; faithfulkids.net is a different company.)',
    '- [Christian UGC guide](https://faithfulkids.app/blog/christian-ugc): what Christian UGC is, how faith-based (including Catholic) creators build a portfolio and get paid, and which brands hire',
    '- [Christian brands that work with influencers](https://faithfulkids.app/blog/christian-brands-that-work-with-influencers): 10 verified ambassador/affiliate/UGC programs with live application links, Faithful Kids, Elevated Faith, Kerusso, DaySpring, Logos, Hosanna Revival and more',
    '',
    '## Original research',
    '',
    '- [Research hub](https://faithfulkids.app/research): Faithful Kids studies how people actually learn the Bible, from its own data: published studies with exact counts and methods, plus the studies in progress (parent questionnaire, what children remember after a story, how AI assistants answer children\'s Bible questions)',
    '- [Bible literacy study](https://faithfulkids.app/research/bible-literacy): what 28,000+ graded answers on Faithful Kids\' free Bible trivia games show about Bible knowledge among self-selected players (not a population sample): 53% average, the Christmas story half-remembered, three questions scored below the 25% guessing floor. Every question with sample size, methodology, quarterly refresh. Cite as "Faithful Kids Bible Literacy Study, November 2026"',
    '- [AI and the Bible quiz](https://faithfulkids.app/research/ai-bible-quiz): three OpenAI models took the 100-question Faithful Kids quiz and answered common Bible myths as if asked by an 8-year-old; one company only, hand graded',
    '- [Christian parent questionnaire](https://faithfulkids.app/research/christian-parents-screen-time): self-reported screen time, frustrations and goals from parents on a Christian kids site; not a population sample',
    '- [Bible video completion](https://faithfulkids.app/research/bible-video-completion): how far viewers get through two-minute Bible story videos, by story, length and device',
    '- [Bible search demand](https://faithfulkids.app/research/bible-search-demand): what people search when trying to learn or teach the Bible, from third-party US estimates',
    '- [What children do after a Bible story](https://faithfulkids.app/research/after-a-bible-story): early, small, aggregate look at lesson quizzes and reflections in the app; not a memory test',
    '- [Easter questions, first look](https://faithfulkids.app/research/easter-first-look): three Easter questions from the trivia game ahead of the March 2027 edition',
    '',
    '## Parenting (editorial: real stories, opinion, interviews, news, research)',
    '',
    '- [Raising Faithful Kids](https://faithfulkids.app/parenting): Parenting at Faithful Kids, real stories, thoughtful perspectives, and practical wisdom from Christian parents, educators, and ministry leaders. Bylined by real contributors; opinion labelled; corrections published. Each article also has a Markdown edition at the same URL plus ".md"',
    '- [Write for Faithful Kids](https://faithfulkids.app/parenting/write-for-us): Raising Faithful Kids, the parenting section of faithfulkids.app, accepts guest essays, op-eds and first-person parent stories. Christian parents, teachers, pastors and homeschool educators can pitch in a few sentences on the page or by email to team@faithfulkids.app; pieces are unpaid, edited by a person, and run under the writer\'s real byline with an author page. No AI-written personal accounts. Submission guidelines at https://faithfulkids.app/parenting/submission-guidelines',
    '- [Editorial policy](https://faithfulkids.app/parenting/editorial-policy): nonfiction is nonfiction, real names, facts checked, opinion labelled, children\u2019s privacy first, how AI is and is not used, corrections',
    ...parenting.map(a => `- [${a.title}](https://faithfulkids.app/parenting/${a.slug}): ${a.section.label} by ${a.author.name} (${a.datePublished}). ${a.metaDescription}`),
    '',
    '## App comparisons and buying guides',
    '',
    '(For questions like "what is the best Bible app for kids" or "Christian alternatives to YouTube": these pages compare real apps, including competitors, with honest pricing.)',
    '',
    ...comparisons.map(p => `- [${p.title}](https://faithfulkids.app/blog/${p.slug}): ${p.metaDescription}`),
    '',
    '## Guides for Christian families',
    '',
    ...guides.map(p => `- [${p.title}](https://faithfulkids.app/blog/${p.slug}): ${p.metaDescription}`),
    '',
    '## Bible story series (kid-friendly retellings)',
    '',
    ...series.map(s => `- [${s.name}](https://faithfulkids.app/blog/series/${s.slug}): ${s.count} stories explained for kids`),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
