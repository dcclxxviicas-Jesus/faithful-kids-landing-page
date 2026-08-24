import { SITE_URL, unsubscribeUrl } from './leads'

// Trial lifecycle emails. The annual plan carries a 3-DAY free trial, so the
// whole sequence is three touches, not the usual week-long drip:
//   T+1d  trial_day1     — get them to press play (varies by setup state)
//   T+2d  trial_day2     — value + "your trial ends tomorrow" + the price
//   end   trial_converted / trial_canceled
// Plus trial_canceling, fired the moment someone sets cancel_at_period_end
// during the trial (the case that lost us a customer in August).
//
// Copy rules: no founder name, sender is always "Faithful Kids", plain
// chrome so Gmail keeps these out of Promotions.

const APP_URL = 'https://app.faithfulkids.app'

export type TrialState = 'no_kids' | 'no_episodes' | 'engaged'
export type TrialEmailType =
  | 'trial_day1'
  | 'trial_day2'
  | 'trial_converted'
  | 'trial_canceling'
  | 'trial_canceled'

export interface TrialContext {
  email: string
  firstName: string | null
  kidNames: string[]
  episodesWatched: number
  lastSeriesName: string | null
  priceLabel: string // e.g. "$77.77/year"
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
<p style="margin:26px 0 0;">— The Faithful Kids Team<br/><span style="color:#6b7280;font-size:13px;">faithfulkids.app</span></p>
<p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
  You're receiving this because you started a Faithful Kids trial.
  <a href="${unsubscribeUrl(email)}" style="color:#9ca3af;">Unsubscribe from tips</a>
</p>
</div></body></html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto;"><tr><td style="background:#059669;border-radius:999px;">
  <a href="${href}" style="display:inline-block;padding:13px 30px;color:#ffffff;font-weight:700;text-decoration:none;font-size:15px;">${label}</a>
</td></tr></table>`
}

// "Ariel and Audrey" / "Ariel, Audrey and Sam" / "your kids"
export function nameList(names: string[]): string {
  if (!names.length) return 'your kids'
  if (names.length === 1) return names[0]
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
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
  const appLink = utm(APP_URL, type)
  const billingLink = utm(`${APP_URL}/parent`, type)

  switch (type) {
    // ---------- Day 1: get them to press play ----------
    case 'trial_day1': {
      if (state === 'no_kids') {
        return {
          subject: 'One quick step before your first story',
          html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Your Faithful Kids account is ready — there's just one thing left before the stories can start: <strong>adding a profile for each child</strong>.</p>
<p>It takes about thirty seconds, and it's what lets each kid keep their own progress, streak, and faith seeds.</p>
${button(utm(`${APP_URL}/profiles`, type), 'Add your kids →')}
<p style="color:#6b7280;font-size:13px;">Stuck on anything at all? Just reply to this email — a real person reads it.</p>`),
        }
      }
      if (state === 'no_episodes') {
        return {
          subject: `${ctx.kidNames[0]}'s first story is waiting`,
          html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>${kids} ${ctx.kidNames.length === 1 ? 'is' : 'are'} all set up — now comes the fun part.</p>
<p>We'd start with <strong>Creation</strong>, the first episode of Genesis. It's about three minutes: a story narrated by Jesus, then a short quiz, then one question to talk about together.</p>
${button(appLink, 'Play the first episode →')}
<p style="color:#6b7280;font-size:13px;">Tip: it works best sitting side by side — most parents tell us the questions their kids ask afterward are the best part.</p>`),
        }
      }
      return {
        subject: 'Nice start 🌱',
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>${kids} finished ${ctx.episodesWatched === 1 ? 'the first episode' : `${ctx.episodesWatched} episodes`} — that's a real start.</p>
<p>${ctx.lastSeriesName ? `The next episode in <strong>${ctx.lastSeriesName}</strong> picks up right where you left off.` : 'The next episode picks up right where you left off.'} Families who watch a few days in a row tend to keep going for months, so the streak counter is worth chasing.</p>
${button(appLink, 'Continue watching →')}
<p style="color:#6b7280;font-size:13px;">Every episode has a quiz and a reflection — those two minutes after the video are where it sticks.</p>`),
      }
    }

    // ---------- Day 2: value + honest heads-up about the charge ----------
    case 'trial_day2': {
      const nudge =
        state === 'no_kids'
          ? `<p>You haven't added a kid profile yet — that's the one step between you and the stories. <a href="${utm(`${APP_URL}/profiles`, type)}" style="color:#059669;font-weight:700;">It takes thirty seconds.</a></p>`
          : state === 'no_episodes'
            ? `<p>${kids} ${ctx.kidNames.length === 1 ? 'hasn\'t' : 'haven\'t'} watched anything yet. If you get one episode in before the trial ends, you'll know whether this is right for your family. <a href="${appLink}" style="color:#059669;font-weight:700;">Start with Creation →</a></p>`
            : `<p>${kids} ${ctx.kidNames.length === 1 ? 'has' : 'have'} already been through ${ctx.episodesWatched === 1 ? 'an episode' : `${ctx.episodesWatched} episodes`} — you're off to a better start than most.</p>`
      return {
        subject: `Your trial ends ${ctx.trialEndsLabel} — here's what to expect`,
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>A quick, honest heads-up so nothing is a surprise: <strong>your free trial ends ${ctx.trialEndsLabel}</strong>, and unless you cancel before then, your subscription starts at <strong>${ctx.priceLabel}</strong>.</p>
${nudge}
<p style="margin-top:18px;">What that subscription includes:</p>
<ul style="margin:0 0 12px;padding-left:20px;">
  <li>200+ video Bible lessons, Genesis through Revelation</li>
  <li>A quiz and a reflection after every story</li>
  <li>Up to 5 kid profiles, each with their own progress</li>
  <li>Zero ads — ever</li>
</ul>
${button(appLink, 'Open Faithful Kids →')}
<p style="color:#6b7280;font-size:13px;">Changed your mind? You can <a href="${billingLink}" style="color:#6b7280;">cancel in one click</a> from your parent dashboard, and there's a 30-day money-back guarantee either way.</p>`),
      }
    }

    // ---------- Converted ----------
    case 'trial_converted':
      return {
        subject: "You're in — thank you 💚",
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Your subscription is active, and we're genuinely glad ${kids} ${ctx.kidNames.length === 1 ? 'is' : 'are'} learning with us. Thank you for backing what we're building.</p>
<p>A few things worth knowing now that you're in:</p>
<ul style="margin:0 0 12px;padding-left:20px;">
  <li>New series unlock as your kids finish the one before</li>
  <li>The parent dashboard shows what each child has watched and how they scored</li>
  <li>You can add up to 5 kid profiles at no extra cost</li>
</ul>
${button(appLink, 'Keep the streak going →')}
<p>If anything ever feels off — a story that didn't land, a feature you wish existed — just reply. We read every message, and small teams change things fast.</p>`),
      }

    // ---------- They set it to cancel, mid-trial ----------
    case 'trial_canceling':
      return {
        subject: 'Before you go — can we help?',
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>We saw your subscription is set to end${ctx.trialEndsLabel ? ` ${ctx.trialEndsLabel}` : ''}, and that's completely okay — no hard feelings and nothing to do.</p>
${
  state === 'engaged'
    ? `<p>One thing though: ${kids} did get through ${ctx.episodesWatched === 1 ? 'an episode' : `${ctx.episodesWatched} episodes`}, so something was working. If it was the price, the timing, or something that annoyed you, we'd honestly love to know — just hit reply.</p>`
    : `<p>If you never quite got started, that's usually our fault rather than yours. If there's a reason it didn't click — confusing setup, wrong ages, not what you expected — hit reply and tell us. We read every one.</p>`
}
<p>Your access stays on until the end of the period, so ${kids} can keep watching in the meantime.</p>
${button(appLink, 'Watch while you still have access →')}
<p style="color:#6b7280;font-size:13px;">Changed your mind? You can turn the subscription back on any time from your <a href="${billingLink}" style="color:#6b7280;">parent dashboard</a>.</p>`),
      }

    // ---------- Trial lapsed without converting ----------
    case 'trial_canceled':
    default:
      return {
        subject: 'The door stays open',
        html: wrap(ctx.email, `
<p>${hi(ctx)}</p>
<p>Your trial has ended and you haven't been charged anything.</p>
<p>If Faithful Kids wasn't the right fit right now, we understand completely. Your account and ${kids === 'your kids' ? 'any progress' : `${kids}'s progress`} will be waiting if you ever want to come back — nothing gets deleted.</p>
<p>And if you'd tell us one honest sentence about why it didn't work, it would genuinely help us build something better. Just reply.</p>
${button(utm(`${SITE_URL}/quiz`, type), 'Start again whenever you like')}
<p style="color:#6b7280;font-size:13px;">In the meantime, our Bible stories, trivia and printables stay free at faithfulkids.app.</p>`),
      }
  }
}
