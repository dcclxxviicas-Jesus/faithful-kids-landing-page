import { EMAILS, type EmailDef } from './emails'
import { escapeHtml, renderEmail, type Block } from './render'

export { EMAILS, SAMPLE_VARS } from './emails'
export type { EmailDef } from './emails'

// Every email shows as "Faithful Kids" in the inbox and is signed by the
// team (owner decision, Nov 16, 2026; this replaces the Aug 2026 split that
// sent customer mail as Christian). Nothing sends from or replies to a
// personal address: replies land in team@, which must be watched because
// customer mail invites them.
export const FROM = {
  brand: 'Faithful Kids <team@faithfulkids.app>',
  christian: 'Faithful Kids <team@faithfulkids.app>',
} as const
export const REPLY_TO = 'team@faithfulkids.app'

export interface BuiltEmail {
  key: string
  subject: string
  html: string
  from: string
  billing: boolean
}

export interface BuildOptions {
  /** Required for every non-billing email; null only for one-time requested mail. */
  unsubscribeUrl?: string | null
  /** Swap the first block of a type, e.g. the quiz recap built from real answers. */
  replace?: Partial<Record<Block[0], Block | null>>
  /** Swap one exact sentence of body copy for another (both plain text). */
  replaceText?: [string, string]
  /** Which of the three subject lines to use (0 is the pick). */
  subject?: number
}

const TOKEN = /\{\{(\w+)\}\}/g

function fill(s: string, vars: Record<string, string>, key: string, html: boolean): string {
  return s.replace(TOKEN, (_, name: string) => {
    const v = vars[name]
    // An unfilled token must never reach an inbox.
    if (v === undefined || v === null || v === '') throw new Error(`email ${key}: no value for {{${name}}}`)
    return html ? escapeHtml(v) : v
  })
}

function fillDeep<T>(x: T, vars: Record<string, string>, key: string): T {
  if (typeof x === 'string') return fill(x, vars, key, true) as unknown as T
  if (Array.isArray(x)) return x.map((i) => fillDeep(i, vars, key)) as unknown as T
  return x
}

export function buildEmail(key: string, vars: Record<string, string>, opts: BuildOptions = {}): BuiltEmail {
  const def: EmailDef | undefined = EMAILS[key]
  if (!def) throw new Error(`unknown email ${key}`)
  // Pass null on purpose for mail a person asked for one time (a confirmation,
  // a pitch receipt). Leaving it out by accident is an error.
  if (!def.billing && opts.unsubscribeUrl === undefined) throw new Error(`email ${key}: unsubscribe link required`)

  let blocks = def.blocks
  if (opts.replace) {
    const seen = new Set<string>()
    blocks = blocks.flatMap((b) => {
      if (!(b[0] in opts.replace!) || seen.has(b[0])) return [b]
      seen.add(b[0])
      const r = opts.replace![b[0]]
      return r ? [r] : []
    })
  }
  if (opts.replaceText) {
    const [from, to] = opts.replaceText
    const before = JSON.stringify(blocks)
    if (!before.includes(JSON.stringify(from).slice(1, -1))) throw new Error(`email ${key}: sentence to replace not found`)
    blocks = JSON.parse(before.split(JSON.stringify(from).slice(1, -1)).join(JSON.stringify(escapeHtml(to).replace(/&#39;/g, '’')).slice(1, -1)))
  }
  // The block type is never a token; fill everything after it.
  const filled = blocks.map((b) => [b[0], ...fillDeep(b.slice(1), vars, key)] as unknown as Block)

  return {
    key,
    subject: fill(def.subjects[opts.subject ?? 0], vars, key, false),
    from: FROM[def.from],
    billing: def.billing,
    html: renderEmail({
      style: def.style,
      blocks: filled,
      pre: fill(def.pre, vars, key, false),
      reason: def.reason,
      unsubscribeUrl: def.billing ? null : opts.unsubscribeUrl,
    }),
  }
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Tokens for the story-count copy: "Five stories", "1 story", and so on. */
export function storyVars(n: number): Record<string, string> {
  const noun = n === 1 ? 'story' : 'stories'
  const word = n <= 12 ? WORDS[n] : String(n)
  return {
    stories: String(n),
    stories_label: `${noun} watched`,
    stories_num: `${n} ${noun}`,
    stories_phrase: `${word} ${noun}`,
    Stories_phrase: `${cap(word)} ${noun}`,
  }
}

/** Tokens for a child's name, falling back to "your child" when there is no single usable name. */
export function childVars(name: string | null): Record<string, string> {
  return name ? { child: name, Child: name } : { child: 'your child', Child: 'Your child' }
}
