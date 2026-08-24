import fs from 'fs'
import path from 'path'

export interface BlogPost {
  title: string
  slug: string
  type: string
  series: string
  seriesSlug: string
  episode: number
  scripture: string
  testament: string
  book: string
  age: string
  themes: string
  metaDescription: string
  keywords: string[]
  content: string
  videoUrl: string
  quizAvailable: boolean
  datePublished: string
  dateModified: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function parseFrontmatter(fileContent: string): { data: Record<string, unknown>; body: string } {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { data: {}, body: fileContent }

  const frontmatter = match[1]
  const body = match[2]
  const data: Record<string, unknown> = {}

  const lines = frontmatter.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    let value = line.slice(colonIndex + 1).trim()

    // Handle YAML arrays like ["item1", "item2"]
    if (value.startsWith('[')) {
      const arrayMatch = value.match(/\[([\s\S]*?)\]/)
      if (arrayMatch) {
        data[key] = arrayMatch[1]
          .split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean)
      }
      continue
    }

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Parse booleans
    if (value === 'true') { data[key] = true; continue }
    if (value === 'false') { data[key] = false; continue }

    // Parse numbers (episode numbers)
    if (/^\d+$/.test(value)) { data[key] = parseInt(value, 10); continue }

    data[key] = value
  }

  return { data, body }
}

function markdownToHtml(md: string): string {
  let html = md

  // Fix faithfulkids.com → faithfulkids.app
  html = html.replace(/faithfulkids\.com/g, 'faithfulkids.app')

  // Convert markdown tables to HTML tables
  html = html.replace(/((?:\|[^\n]+\|\n)+)/g, (tableBlock) => {
    const rows = tableBlock.trim().split('\n').filter(r => r.trim())
    if (rows.length < 2) return tableBlock
    // Check if second row is separator (|---|---|)
    const isSep = (r: string) => /^\|[\s\-:|]+\|$/.test(r.trim())
    const headerRow = rows[0]
    const hasSep = isSep(rows[1])
    const dataRows = hasSep ? rows.slice(2) : rows.slice(1)
    const parseRow = (r: string) => r.split('|').slice(1, -1).map(c => c.trim())

    let table = '<div style="overflow-x:auto;margin:20px 0"><table style="width:100%;border-collapse:collapse;font-size:14px">'
    if (hasSep) {
      const cells = parseRow(headerRow)
      table += '<thead><tr>' + cells.map(c => `<th style="border:1px solid #e5e5e5;padding:10px 12px;background:#f7f7f7;font-weight:700;text-align:left">${applyInlineFormatting(c)}</th>`).join('') + '</tr></thead>'
    }
    table += '<tbody>'
    for (const row of (hasSep ? dataRows : rows)) {
      const cells = parseRow(row)
      table += '<tr>' + cells.map(c => `<td style="border:1px solid #e5e5e5;padding:10px 12px">${applyInlineFormatting(c)}</td>`).join('') + '</tr>'
    }
    table += '</tbody></table></div>'
    return table
  })

  // Process line by line for block elements
  const lines = html.split('\n')
  const output: string[] = []
  let inList = false
  let listType: 'ul' | 'ol' = 'ul'
  let inParagraph = false

  function closeList() {
    if (inList) {
      output.push(listType === 'ol' ? '</ol>' : '</ul>')
      inList = false
    }
  }

  function closeParagraph() {
    if (inParagraph) {
      output.push('</p>')
      inParagraph = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line — close open blocks
    if (trimmed === '') {
      closeList()
      closeParagraph()
      continue
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      closeList()
      closeParagraph()
      const text = applyInlineFormatting(trimmed.slice(4))
      output.push(`<h3>${text}</h3>`)
      continue
    }
    if (trimmed.startsWith('## ')) {
      closeList()
      closeParagraph()
      const text = applyInlineFormatting(trimmed.slice(3))
      output.push(`<h2>${text}</h2>`)
      continue
    }
    // The page template renders the frontmatter title as the page <h1>,
    // so any body-level `#` heading is demoted to <h2> to keep one H1 per page
    if (trimmed.startsWith('# ')) {
      closeList()
      closeParagraph()
      const text = applyInlineFormatting(trimmed.slice(2))
      output.push(`<h2>${text}</h2>`)
      continue
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      closeList()
      closeParagraph()
      const text = applyInlineFormatting(trimmed.slice(2))
      output.push(`<blockquote>${text}</blockquote>`)
      continue
    }

    // Horizontal rules
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      closeList()
      closeParagraph()
      output.push('<hr />')
      continue
    }

    // Unordered lists
    if (trimmed.startsWith('- ')) {
      closeParagraph()
      if (!inList || listType !== 'ul') {
        closeList()
        output.push('<ul>')
        inList = true
        listType = 'ul'
      }
      const text = applyInlineFormatting(trimmed.slice(2))
      output.push(`<li>${text}</li>`)
      continue
    }

    // Ordered lists
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (olMatch) {
      closeParagraph()
      if (!inList || listType !== 'ol') {
        closeList()
        output.push('<ol>')
        inList = true
        listType = 'ol'
      }
      const text = applyInlineFormatting(olMatch[2])
      output.push(`<li>${text}</li>`)
      continue
    }

    // Normal text — wrap in paragraphs
    closeList()
    if (!inParagraph) {
      output.push('<p>')
      inParagraph = true
    }
    output.push(applyInlineFormatting(trimmed))
  }

  closeList()
  closeParagraph()

  return output.join('\n')
}

function applyInlineFormatting(text: string): string {
  // Links: [text](url) — block javascript: protocol to prevent XSS
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    if (url.toLowerCase().trimStart().startsWith('javascript:')) return linkText;
    if (url.toLowerCase().trimStart().startsWith('data:')) return linkText;
    if (url.toLowerCase().trimStart().startsWith('vbscript:')) return linkText;
    return `<a href="${url}">${linkText}</a>`;
  })

  // Images: ![alt](src)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // Bold + italic: ***text*** or ___text___
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')

  // Bold: **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Italic: *text* or _text_ (but not inside URLs or words with underscores)
  text = text.replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, '<em>$1</em>')
  text = text.replace(/(?<!\w)_([^_]+?)_(?!\w)/g, '<em>$1</em>')

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Line breaks (double space at end)
  text = text.replace(/  $/, '<br />')

  return text
}

function readPost(filename: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, filename)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, body } = parseFrontmatter(fileContent)

  if (!data.slug || !data.title) return null

  // 285 legacy posts open with a `# Title` line that duplicates the page
  // template's <h1> — drop it (the page renders the frontmatter title)
  const bodyWithoutLeadingH1 = body.replace(/^\s*# [^\n]*\n+/, '')

  return {
    title: (data.title as string) || '',
    slug: (data.slug as string) || '',
    type: (data.type as string) || 'episode',
    series: (data.series as string) || '',
    seriesSlug: (data.seriesSlug as string) || '',
    episode: (data.episode as number) || 0,
    scripture: (data.scripture as string) || '',
    testament: (data.testament as string) || '',
    book: (data.book as string) || '',
    age: (data.age as string) || 'Ages 5+',
    themes: (data.themes as string) || '',
    metaDescription: (data.metaDescription as string) || '',
    keywords: (data.keywords as string[]) || [],
    content: markdownToHtml(bodyWithoutLeadingH1),
    videoUrl: (data.videoUrl as string) || '',
    quizAvailable: (data.quizAvailable as boolean) || false,
    // Posts written before dates were tracked keep the original launch dates
    datePublished: (data.datePublished as string) || '2026-04-01',
    dateModified: (data.dateModified as string) || (data.datePublished as string) || '2026-04-16',
  }
}

let cachedPosts: BlogPost[] | null = null

export function getAllPosts(): BlogPost[] {
  if (cachedPosts) return cachedPosts

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  const posts = files
    .map(f => readPost(f))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => {
      const seriesCompare = a.series.localeCompare(b.series)
      if (seriesCompare !== 0) return seriesCompare
      return a.episode - b.episode
    })

  cachedPosts = posts
  return posts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug)
}

export function getPostsBySeriesSlug(seriesSlug: string): BlogPost[] {
  return getAllPosts().filter(p => p.seriesSlug === seriesSlug)
}

export function getAllSeriesNames(): { name: string; slug: string; count: number }[] {
  const posts = getAllPosts()
  const seriesMap = new Map<string, { name: string; slug: string; count: number }>()

  for (const post of posts) {
    if (!post.series || !post.seriesSlug) continue // Skip listicles with no series
    const existing = seriesMap.get(post.seriesSlug)
    if (existing) {
      existing.count++
    } else {
      seriesMap.set(post.seriesSlug, {
        name: post.series,
        slug: post.seriesSlug,
        count: 1,
      })
    }
  }

  return Array.from(seriesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Extract FAQ items from the HTML content (from ## Frequently Asked Questions section).
 * Returns an array of { question, answer } objects for JSON-LD schema.
 */
export function extractFaqFromContent(content: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []

  // Find all h3 + following text in the FAQ section
  const faqSectionMatch = content.match(/<h2>Frequently Asked Questions<\/h2>([\s\S]*?)(?=<h2>|$)/)
  if (!faqSectionMatch) return faqs

  const faqHtml = faqSectionMatch[1]
  const h3Regex = /<h3>(.*?)<\/h3>([\s\S]*?)(?=<h3>|$)/g
  let match

  while ((match = h3Regex.exec(faqHtml)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim()
    const answer = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (question && answer) {
      faqs.push({ question, answer })
    }
  }

  return faqs
}

/**
 * Extract discussion questions from the HTML content.
 * Returns an array of { question, answer } objects for JSON-LD schema.
 */
export function extractDiscussionQuestions(content: string): { question: string; answer: string }[] {
  const questions: { question: string; answer: string }[] = []

  const sectionMatch = content.match(/<h2>Discussion Questions for (?:Parents|Families)<\/h2>([\s\S]*?)(?=<h2>|$)/)
  if (!sectionMatch) return questions

  const sectionHtml = sectionMatch[1]
  const liRegex = /<li>(.*?)<\/li>/g
  let match

  while ((match = liRegex.exec(sectionHtml)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim()
    if (question) {
      questions.push({
        question,
        answer: 'Discuss this question together as a family. There is no single right answer — the goal is to help your child think deeply about the story and connect it to their own life.',
      })
    }
  }

  return questions
}

export interface TriviaQuestion {
  question: string
  answer: string
  citation: string
}

/**
 * Extract trivia questions from HTML content.
 * Matches list items shaped like: Question? <strong>Answer</strong> (Citation)
 */
export function extractTriviaQuestions(content: string): TriviaQuestion[] {
  const questions: TriviaQuestion[] = []

  // Format A (book trivia posts): <li>Question? <strong>Answer</strong> (Citation)</li>
  const liRegex = /<li>([\s\S]*?)<\/li>/g
  let match
  while ((match = liRegex.exec(content)) !== null) {
    const item = match[1]
    const strongMatch = item.match(/^([\s\S]*?)<strong>([\s\S]*?)<\/strong>\s*(?:\(([^)]+)\))?/)
    if (!strongMatch) continue
    const question = strongMatch[1].replace(/<[^>]+>/g, '').trim()
    const answer = strongMatch[2].replace(/<[^>]+>/g, '').trim()
    const citation = (strongMatch[3] || '').trim()
    // Only real Q&A items: the part before the answer must be a question
    if (question.endsWith('?') && answer) {
      questions.push({ question, answer, citation })
    }
  }

  // Format B (legacy trivia posts):
  //   <strong>1. Question?</strong> ... Answer: Noah (Genesis 6-9)
  //   <strong>1. Question?</strong> ... Answer: <strong>Bethlehem</strong> (Luke 2:4-7)
  const qaRegex = /<strong>\s*\d+\.\s*([^<]+\?)\s*<\/strong>[\s\S]{0,40}?Answer:\s*(?:<strong>)?([^<(\n]+?)(?:<\/strong>)?\s*(?:\(([^)]+)\))?\s*(?=\n|<)/g
  while ((match = qaRegex.exec(content)) !== null) {
    const question = match[1].trim()
    const answer = match[2].trim().replace(/[.,;]$/, '')
    const citation = (match[3] || '').trim()
    if (question && answer) {
      questions.push({ question, answer, citation })
    }
  }

  return questions
}

/**
 * Estimate reading time from HTML content.
 */
export function getReadingTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const words = text.split(' ').filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

/**
 * Hero stories — the most popular / iconic posts across all series.
 * Used for cross-series internal linking on blog posts.
 */
const HERO_STORIES = [
  'in-the-beginning-creation-for-kids',
  'noah-and-the-great-flood-for-kids',
  'abraham-and-isaac-for-kids',
  'the-burning-bush-for-kids',
  'the-ten-commandments-for-kids',
  'david-and-goliath-for-kids',
  'daniel-in-the-lions-den-for-kids',
  'jonah-running-from-god-for-kids',
  'an-angel-visits-mary-for-kids',
  'the-good-samaritan-for-kids',
  'the-prodigal-son-for-kids',
  'walking-on-water-for-kids',
  'feeding-the-five-thousand-for-kids',
  'the-last-supper-for-kids',
  'the-cross-for-kids',
  'the-empty-tomb-for-kids',
  'the-day-of-pentecost-for-kids',
  'shipwrecked-for-kids',
  'the-armor-of-god-for-kids',
  'love-is-for-kids',
]

/**
 * Get 3-5 hero story links from OTHER series for cross-linking.
 * Filters out stories from the same series as the current post.
 */
export function getHeroStoryLinks(currentSlug: string, currentSeriesSlug: string): BlogPost[] {
  const allPosts = getAllPosts()
  const heroSlugs = HERO_STORIES.filter(s => s !== currentSlug)

  const heroes = heroSlugs
    .map(slug => allPosts.find(p => p.slug === slug))
    .filter((p): p is BlogPost => p !== null && p !== undefined && p.seriesSlug !== currentSeriesSlug)

  return heroes.slice(0, 5)
}

// Tokens too generic to signal topical relatedness between guide slugs
const RELATED_STOPWORDS = new Set([
  'for', 'kids', 'the', 'and', 'with', 'your', 'child', 'children',
  'bible', 'how', 'what', 'who', 'was', 'about', 'best', 'christian',
])

/**
 * Related guides for posts that have no series (the 233 listicles/guides).
 * Scores other guides by shared meaningful slug tokens so each guide page
 * gets topically related links instead of an arbitrary fixed set.
 */
export function getRelatedGuides(post: BlogPost, limit = 6): BlogPost[] {
  const tokens = new Set(
    post.slug.split('-').filter(t => t.length > 2 && !RELATED_STOPWORDS.has(t))
  )

  return getAllPosts()
    .filter(p => p.slug !== post.slug && !p.seriesSlug)
    .map(p => ({
      post: p,
      score: p.slug.split('-').filter(t => tokens.has(t)).length,
    }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.post)
}

// ---------------------------------------------------------------------------
// Trivia cross-linking: after a reader finishes one game, point them at more.
// ---------------------------------------------------------------------------

export interface TriviaLink {
  slug: string
  label: string
  count: number
}

const SMALL_WORDS = new Set(['of', 'the', 'and', 'for', 'to', 'in'])

/** "1-corinthians-bible-trivia" -> "1 Corinthians"; falls back to the title. */
export function triviaLabel(slug: string, title: string): string {
  const m = slug.match(/^(.+)-bible-trivia$/)
  if (!m) return title.split(/[:(]/)[0].trim()
  return m[1]
    .split('-')
    .map((w, i) =>
      /^\d+$/.test(w) ? w
      : i > 0 && SMALL_WORDS.has(w) ? w
      : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ')
}

let cachedPlayable: TriviaLink[] | null = null

/** Every post that actually has a playable game (>= 10 extractable Q&A). */
export function getPlayableTrivia(): TriviaLink[] {
  if (cachedPlayable) return cachedPlayable
  cachedPlayable = getAllPosts()
    .filter(p => /trivia/i.test(p.slug))
    .map(p => ({
      slug: p.slug,
      label: triviaLabel(p.slug, p.title),
      count: extractTriviaQuestions(p.content).length,
    }))
    .filter(t => t.count >= 10)
  return cachedPlayable
}

/**
 * Games to suggest when a round ends. Deterministic per page (so the build is
 * stable) but varied across pages, seeded off the current slug.
 */
export function getRelatedTrivia(currentSlug: string, limit = 6): TriviaLink[] {
  const pool = getPlayableTrivia().filter(t => t.slug !== currentSlug)
  let seed = 0
  for (let i = 0; i < currentSlug.length; i++) seed = (seed * 31 + currentSlug.charCodeAt(i)) >>> 0
  return pool
    .map(t => {
      let h = seed
      for (let i = 0; i < t.slug.length; i++) h = (h * 33 + t.slug.charCodeAt(i)) >>> 0
      return { t, h }
    })
    .sort((a, b) => a.h - b.h)
    .slice(0, limit)
    .map(x => x.t)
}
