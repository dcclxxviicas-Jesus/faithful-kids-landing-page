import fs from 'fs'
import path from 'path'

export interface BlogPost {
  title: string
  slug: string
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
    if (trimmed.startsWith('# ')) {
      closeList()
      closeParagraph()
      const text = applyInlineFormatting(trimmed.slice(2))
      output.push(`<h1>${text}</h1>`)
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
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

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

  return {
    title: (data.title as string) || '',
    slug: (data.slug as string) || '',
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
    content: markdownToHtml(body),
    videoUrl: (data.videoUrl as string) || '',
    quizAvailable: (data.quizAvailable as boolean) || false,
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

  const sectionMatch = content.match(/<h2>Discussion Questions for Parents<\/h2>([\s\S]*?)(?=<h2>|$)/)
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

/**
 * Estimate reading time from HTML content.
 */
export function getReadingTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const words = text.split(' ').filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
