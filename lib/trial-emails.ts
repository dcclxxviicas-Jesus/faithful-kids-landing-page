import { SITE_URL, unsubscribeUrl } from './leads'

// Trial lifecycle emails. The annual plan carries a 3-DAY free trial, so the
// whole sequence is three touches, not the usual week-long drip:
//   T+1d  trial_day1     get them to press play (varies by setup state)
//   T+2d  trial_day2     momentum only, never billing (see below)
//   end   trial_converted / trial_canceled
// Plus trial_canceling, fired the moment someone sets cancel_at_period_end
// during the trial (the case that lost us a customer in August).
//
// Copy rules: no founder name, sender is always "Faithful Kids", plain
// chrome so Gmail keeps these out of Promotions.

const APP_URL = 'https://app.faithfulkids.app'

// Trial mail comes from Christian, not the brand: every one of these emails
// invites a reply, and christian@faithfulkids.app is a monitored inbox.
// (Cold lead nurture still sends as "Faithful Kids"; see lib/lead-emails.ts.)
export const TRIAL_FROM = 'Christian Alexander <christian@faithfulkids.app>'

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
}

function utm(url: string, type: TrialEmailType): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}utm_source=email&utm_medium=trial&utm_campaign=${type}`
}

function wrap(email: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:28px 20px;color:#1f2937;font-size:15px;line-height:1.65;">
${bodyHtml}
<p style="margin:26px 0 0;">— Christian from Faithful Kids<br/><span style="color:#6b7280;font-size:13px;">faithfulkids.app</span></p>
<p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
  You're receiving this because you have a Faithful Kids account.
  <a href="${unsubscribeUrl(email)}" style="color:#9ca3af;">Unsubscribe from tips</a>
</p>
</div></body></html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto;"><tr><td style="background:#16a34a;border-radius:999px;">
  <a href="${href}" style="display:inline-block;padding:13px 30px;color:#ffffff;font-weight:700;text-decoration:none;font-size:15px;">${label}</a>
</td></tr></table>`
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

const hi = (ctx: TrialContext) => (ctx.firstName ? `Hi ${ctx.firstName},` : 'Hi there,')

export function buildTrialEmail(
  ctx: TrialContext,
  type: TrialEmailType
): { subject: string; html: string } {
  const state = trialState(ctx)
  const kids = nameList(ctx.kidNames)
  const plural = ctx.kidNames.length !== 1
  const appLink = utm(APP_URL, type)
  const billingLink = utm(`${APP_URL}/parent`, type)

  switch (type) {
    // ---------- Day 1: get them to press play ----------
    case 'trial_day1': {
      if (state === 'no_kids') {
        return {
          subject: 'One step before your first story',
          html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Your account is ready. One step left: add a profile for each child.</p>
<p>It takes about thirty seconds, and it's what lets each kid keep their own progress and streak.</p>
${button(utm(`${APP_URL}/profiles`, type), 'Add your kids →')}
<p style="color:#6b7280;font-size:13px;">Stuck on anything? Just reply. This comes straight to my inbox.</p>`),
        }
      }
      if (state === 'no_episodes') {
        return {
          subject: looksLikeRealName(ctx.kidNames[0] || '')
            ? `${ctx.kidNames[0]}'s first story is waiting`
            : 'Their first story is waiting',
          html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>${kids} ${plural ? 'are' : 'is'} all set up. Now the fun part.</p>
<p>Start with <strong>Creation</strong>, the first episode of Genesis. Three minutes: a story narrated by Jesus, a short quiz, then one question to talk about together.</p>
${button(appLink, 'Play the first episode →')}
<p style="color:#6b7280;font-size:13px;">Watch it side by side if you can. Most parents say the questions their kids ask afterward are the best part.</p>`),
        }
      }
      return {
        subject: 'Nice start 🌱',
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>${kids} finished ${ctx.episodesWatched === 1 ? 'the first episode' : `${ctx.episodesWatched} episodes`}. That's a real start.</p>
<p>${ctx.lastSeriesName ? `<strong>${ctx.lastSeriesName}</strong> picks up` : 'The next episode picks up'} right where you left off.</p>
${button(appLink, 'Continue watching →')}
<p style="color:#6b7280;font-size:13px;">Families who watch a few days in a row tend to keep going for months.</p>`),
      }
    }

    // ---------- Day 2: momentum, never billing ----------
    // No charge reminder by design: for trials under 7 days the card networks
    // want the terms in the enrollment confirmation, which is where they live.
    case 'trial_day2': {
      if (state === 'no_kids') {
        return {
          subject: 'Your first story is still waiting',
          html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Everything is ready on our side. One step left: a profile for each child, about thirty seconds.</p>
${button(utm(`${APP_URL}/profiles`, type), 'Add your kids →')}
<p>Then start with <strong>Creation</strong>. Three minutes, and the conversation afterward is usually the best part.</p>
<p style="color:#6b7280;font-size:13px;">If something is in the way, a login that won't work or a question about ages, just reply and tell me.</p>`),
        }
      }
      if (state === 'no_episodes') {
        return {
          subject: 'Three minutes, one story',
          html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>${kids} ${plural ? 'are' : 'is'} ready to go but ${plural ? "haven't" : "hasn't"} watched a story yet. So here is the smallest possible start.</p>
<p><strong>One episode. Three minutes.</strong> Creation, the first story in Genesis: narrated by Jesus, a handful of questions, then one thing to talk about together.</p>
${button(appLink, 'Play Creation →')}
<p>That's all it takes to know whether this is right for your family. Bedtime, breakfast, the car, wherever three minutes fits.</p>`),
        }
      }
      return {
        subject: 'Look what they did this week',
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Where ${kids} ${plural ? 'have' : 'has'} got to:</p>
<p style="font-size:20px;font-weight:800;margin:14px 0;color:#16a34a;">${ctx.episodesWatched} ${ctx.episodesWatched === 1 ? 'episode' : 'episodes'} finished</p>
<p>Every one was a full story, a quiz, and a reflection. Not a video playing in the background. That's the part that sticks.</p>
<p>${ctx.lastSeriesName ? `<strong>${ctx.lastSeriesName}</strong> picks up` : 'The next episode picks up'} where you left off, and finishing a series unlocks the next one.</p>
${button(appLink, 'Keep going →')}`),
      }
    }

    // ---------- Converted ----------
    case 'trial_converted':
      return {
        subject: "You're in. Thank you 💚",
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Your subscription is active. Thank you for backing what we're building.</p>
<ul style="margin:0 0 12px;padding-left:20px;">
  <li>New series unlock as your kids finish the one before</li>
  <li>The parent dashboard shows what each child watched and scored</li>
  <li>You can add up to 5 kid profiles at no extra cost</li>
</ul>
${button(appLink, 'Keep the streak going →')}
<p>If anything ever feels off, a story that didn't land or a feature you wish existed, just reply and tell me. I read every message.</p>`),
      }

    // ---------- They set it to cancel, mid-trial ----------
    case 'trial_canceling':
      return {
        subject: 'Before you go, can we help?',
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>We saw your subscription is set to end${ctx.trialEndsLabel ? ` ${ctx.trialEndsLabel}` : ''}. That's completely okay and there's nothing you need to do.</p>
${
  state === 'engaged'
    ? `<p>One thing though: ${kids} did get through ${ctx.episodesWatched === 1 ? 'an episode' : `${ctx.episodesWatched} episodes`}, so something was working. If it was the price, the timing, or something that annoyed you, I'd like to know. Just hit reply.</p>`
    : `<p>If you never quite got started, that's usually our fault rather than yours. If there's a reason it didn't click, confusing setup or not what you expected, hit reply and tell me. I read every one.</p>`
}
<p>Your access stays on until the end of the period.</p>
${button(appLink, 'Watch while you still have access →')}
<p style="color:#6b7280;font-size:13px;">Changed your mind? You can turn it back on any time from your <a href="${billingLink}" style="color:#6b7280;">parent dashboard</a>.</p>`),
      }

    // ---------- Paying, but has never opened an episode ----------
    // Not a trial email: this covers any active subscriber, including the
    // monthly plan which has no trial and therefore no other touchpoint.
    case 'never_watched':
      return {
        subject: looksLikeRealName(ctx.kidNames[0] || '')
          ? `Where to start with ${kids}`
          : 'Where to start',
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Thanks for joining us.${ctx.kidNames.some(isSelfProfile) ? ' I saw you set up a profile for yourself as well as the kids, which is my favourite way to do it.' : ''}</p>
<p>If you have three minutes today, start with <strong>Creation</strong>, the first episode of Genesis. A story narrated by Jesus, a few questions, then one thing to talk about together. That last part is where it sticks.</p>
${button(appLink, 'Start with Creation →')}
<p style="color:#6b7280;font-size:13px;">Anything at all in the way, just reply. This comes straight to me.</p>`),
      }

    // ---------- Trial lapsed without converting ----------
    case 'trial_canceled':
    default:
      return {
        subject: 'The door stays open',
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Your trial has ended and you haven't been charged.</p>
<p>If Faithful Kids wasn't the right fit, we understand. Your account and any progress will be waiting if you come back. Nothing gets deleted.</p>
<p>If you'd send me one honest sentence about why it didn't work, it would help me build something better. Just reply.</p>
${button(utm(`${SITE_URL}/quiz`, type), 'Start again whenever you like')}
<p style="color:#6b7280;font-size:13px;">Our Bible stories, trivia and printables stay free at faithfulkids.app.</p>`),
      }
  }
}
