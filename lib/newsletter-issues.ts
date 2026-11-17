import { buildEmail, type BuiltEmail } from './email-system'
import { getPublicArticle } from './parenting'
import { getWatchStories } from './parenting-watch'
import { newsletterUnsubscribeUrl } from './parenting-db'

/*
 * Faithful Kids Weekly issues (owner decisions, Nov 16, 2026):
 *  - An issue goes out only when there is a new essay, not on a fixed weekly
 *    day. The signup copy promises "when we publish a new essay", nothing more.
 *  - Claude drafts each issue here; Cas reads the test email and presses
 *    "Send to all confirmed" in /cas-admin/parenting. Nothing sends on a timer.
 *  - Each issue: one essay, a two-sentence summary that is useful without a
 *    click, one "Try tonight" idea, one free link, one quiet app line.
 *
 * Essay title, byline, URL and the app-line story are read from the essay
 * itself, so they can never disagree with the page. The image must exist as
 * a JPG at CDN email/p-<slug>.jpg (webp fails in Outlook).
 *
 * Copy rules: no em-dashes, no " -- ", subject 32 characters or fewer,
 * speak as "we", never name Christian. `issueProblems` enforces what it can.
 */

export interface Issue {
  /** Permanent id, also the send-log key: never reuse or rename after sending. */
  id: string
  essay: string // slug in content/parenting
  subject: string
  pre: string
  headline: string
  summary: string
  tryTonight: string
  link: { label: string; url: string } // a free page on faithfulkids.app
}

export const ISSUES: Issue[] = [
  {
    id: '2026-11-17-every-home-is-teaching-something',
    essay: 'every-home-is-teaching-something',
    subject: 'Your home is already teaching',
    pre: 'A new essay by Natalie Batan, plus one idea to try tonight.',
    headline: 'Your kids are reading the house',
    summary: 'Long before children can read a verse, they read the way a home handles a spill, a guest and a long day. Natalie Batan writes about the bread, the laundry and the open door as daily lessons in grace.',
    tryTonight: 'Fold the laundry with your kids tonight instead of after they go to bed. Let the youngest match the socks, and ask each child about their day while the pile goes down.',
    link: { label: 'For the table this December: the free Advent Readings, five minutes a night', url: 'https://faithfulkids.app/printables/advent-readings' },
  },
]

export function getIssue(id: string): Issue | undefined {
  return ISSUES.find(i => i.id === id)
}

const utm = (url: string, issue: Issue) =>
  `${url}${url.includes('?') ? '&' : '?'}utm_source=email&utm_medium=weekly&utm_campaign=weekly-${issue.id}&utm_content=parenting-newsletter`

/** Copy problems that must block a send. Empty array means OK. */
export function issueProblems(issue: Issue): string[] {
  const out: string[] = []
  const a = getPublicArticle(issue.essay)
  if (!a) out.push(`essay "${issue.essay}" is not published`)
  if ([...issue.subject].length > 32) out.push(`subject is ${[...issue.subject].length} characters (max 32)`)
  const text = [issue.subject, issue.pre, issue.headline, issue.summary, issue.tryTonight, issue.link.label].join(' ')
  if (/—| -- /.test(text)) out.push('copy contains an em-dash or " -- "')
  if (/\bChristian Alexander\b|\bI\b/.test(text)) out.push('copy names Christian or speaks as "I"; issues speak as "we"')
  if (!/^https:\/\/faithfulkids\.app\//.test(issue.link.url)) out.push('second link must be a faithfulkids.app page')
  return out
}

export function buildIssue(issue: Issue, to: string): BuiltEmail {
  const a = getPublicArticle(issue.essay)
  if (!a) throw new Error(`issue ${issue.id}: essay ${issue.essay} not found`)
  const story = getWatchStories(a).stories[0]
  const essayUrl = utm(`https://faithfulkids.app/parenting/${a.slug}`, issue)
  return buildEmail('weekly/issue', {
    subject: issue.subject,
    pre: issue.pre,
    campaign: `weekly-${issue.id}`,
    headline: issue.headline,
    summary: issue.summary,
    image_key: `p-${a.slug}`,
    image_alt: a.imageAlt || a.title,
    essay_title: a.title,
    byline: a.author.name,
    essay_url: essayUrl,
    try_tonight: issue.tryTonight,
    link_label: issue.link.label,
    link_url: utm(issue.link.url, issue),
    story_title: story.title,
    story_url: utm(`https://faithfulkids.app${story.href}`, issue),
  }, { unsubscribeUrl: newsletterUnsubscribeUrl(to) })
}
