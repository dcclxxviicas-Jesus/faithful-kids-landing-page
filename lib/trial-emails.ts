import { unsubscribeUrl } from './leads'
import { buildEmail, childVars, storyVars, FROM } from './email-system'
import type { Block } from './email-system/render'

// Trial lifecycle emails. The annual plan carries a free trial — seven days
// on the web since 2026-09-16, three through Apple — so the sequence is three
// touches rather than a week-long drip:
//   T+1d        trial_day1  get them to press play (varies by setup state)
//   T-2d        trial_day2  momentum only, never billing (see below)
//   after       trial_converted / trial_canceled
// Note the second one is timed off the BILLING date, not signup: when the
// trial was three days those were the same moment, and they are not now.
// trial-runner.ts owns that timing.
// Plus trial_canceling, fired the moment someone sets cancel_at_period_end
// during the trial (the case that lost us a customer in August).
//
// Copy and design live in lib/email-system (the "Home" design). This file
// picks the right email for the family's setup state and fills in their data.

// Trial mail shows as "Faithful Kids" from team@, like everything else
// (owner decision, Nov 16, 2026). These emails invite a reply, so team@ must
// be a watched inbox.
export const TRIAL_FROM = FROM.christian
export { REPLY_TO as TRIAL_REPLY_TO } from './email-system'

export type TrialState = 'no_kids' | 'no_episodes' | 'engaged'
export type TrialEmailType =
  | 'trial_day1'
  | 'trial_day2'
  | 'trial_converted'
  | 'trial_canceling'
  | 'trial_canceled'
  | 'never_watched'

export interface TrialContext {
  email: string
  firstName: string | null
  kidNames: string[]
  episodesWatched: number
  lastSeriesName: string | null
  priceLabel: string // e.g. "$97/year"
  trialEndsLabel: string // e.g. "Tuesday"
  /** Sum of quiz scores across watched episodes. */
  quizStars: number
  /** Longest current streak across the family's kids. */
  streak: number
  /** Trial end as a full date, "November 21, 2026", or null if unknown. */
  trialEndDate: string | null
}

// Plenty of parents type placeholders into the profile screen ("Kid 1",
// "Older c3", "test"). Dropping those into a warm email reads as a broken
// mail merge, so anything that doesn't look like a real name disqualifies
// the whole list and we fall back to "your kids".
const GENERIC_NAME = /^(kid|kids|child|children|boy|girl|older|younger|oldest|youngest|son|daughter|baby|test|profile|user|me|mum|mom|dad|parent|abc|xyz)\b/i

// Profiles a parent made for themselves. Real, but not a child, so they get
// dropped from "Dominion and Dominic-david" style lists rather than poisoning
// the whole list the way a placeholder does.
const SELF_NAME = /^(myself|me|mum|mom|mommy|mum+y|dad|daddy|papa|parent|grandma|grandpa|nana)$/i

export function isSelfProfile(name: string): boolean {
  return SELF_NAME.test((name || '').trim())
}

export function looksLikeRealName(name: string): boolean {
  const n = (name || '').trim()
  if (n.length < 2 || n.length > 20) return false
  if (/\d/.test(n)) return false // "Kid 1", "Older c3"
  if (GENERIC_NAME.test(n)) return false
  return /^[\p{L}][\p{L}'’. -]*$/u.test(n)
}

// "Ariel and Audrey" / "Ariel, Audrey and Sam" / "your kids"
export function nameList(names: string[]): string {
  const kidsOnly = names.filter((n) => !isSelfProfile(n))
  const usable = kidsOnly.filter(looksLikeRealName)
  if (!usable.length || usable.length !== kidsOnly.length) return 'your kids'
  if (usable.length === 1) return usable[0]
  return usable.slice(0, -1).join(', ') + ' and ' + usable[usable.length - 1]
}

export function trialState(ctx: TrialContext): TrialState {
  if (!ctx.kidNames.length) return 'no_kids'
  if (ctx.episodesWatched === 0) return 'no_episodes'
  return 'engaged'
}

/** The one child's name when there is exactly one usable name, else null. */
function singleChild(names: string[]): string | null {
  const kids = names.filter((n) => !isSelfProfile(n))
  return kids.length === 1 && looksLikeRealName(kids[0]) ? kids[0].trim() : null
}

export function buildTrialEmail(
  ctx: TrialContext,
  type: TrialEmailType
): { subject: string; html: string } {
  const state = trialState(ctx)
  const vars: Record<string, string> = {
    parent: ctx.firstName || 'there',
    ...childVars(singleChild(ctx.kidNames)),
    ...storyVars(ctx.episodesWatched),
    stars: String(ctx.quizStars),
    streak: String(ctx.streak),
  }
  const opts: { unsubscribeUrl: string; replace?: Partial<Record<Block[0], Block | null>>; subject?: number } = {
    unsubscribeUrl: unsubscribeUrl(ctx.email),
  }
  // Only show numbers that are worth showing: a zero is not a celebration.
  const stats: [string, string][] = [[vars.stories, vars.stories_label]]
  if (ctx.quizStars > 0) stats.push([vars.stars, 'quiz stars'])
  if (ctx.streak > 1) stats.push([vars.streak, 'day streak'])

  let key: string
  switch (type) {
    // Day 1: get them to press play.
    case 'trial_day1':
      key = state === 'no_kids' ? 'trial/1-noprofile' : state === 'engaged' ? 'trial/1-engaged' : 'trial/1'
      break

    // The later trial email: momentum, never billing. Fires about two days
    // before the charge (see trial-runner). Still NO charge reminder,
    // re-confirmed by the owner when the trial was lengthened: the terms live
    // in the enrollment confirmation. Do not add a "your trial ends tomorrow"
    // email here without asking.
    case 'trial_day2':
      key = state === 'no_kids' ? 'trial/2-noprofile' : state === 'engaged' ? 'trial/2' : 'trial/2-noactivity'
      if (key === 'trial/2') opts.replace = { stats: ['stats', stats] }
      break

    case 'trial_converted':
      key = 'trial/3a'
      if (!ctx.firstName) opts.subject = 2 // the pick thanks them by name
      break

    // They set it to cancel mid-trial: confirm it plainly, no arguing.
    case 'trial_canceling':
      key = 'trial/3b'
      if (!ctx.trialEndDate) throw new Error('trial_canceling needs the trial end date')
      vars.trial_end_date = ctx.trialEndDate
      vars.trial_end_short = ctx.trialEndDate.replace(/,\s*\d{4}$/, '')
      break

    case 'trial_canceled':
      key = 'trial/3c'
      break

    // A paying customer who has watched nothing: the same first-story nudge
    // a new monthly customer gets.
    case 'never_watched':
    default:
      key = state === 'no_kids' ? 'monthly/1-noprofile' : 'monthly/1'
  }
  const e = buildEmail(key, vars, opts)
  return { subject: e.subject, html: e.html }
}
