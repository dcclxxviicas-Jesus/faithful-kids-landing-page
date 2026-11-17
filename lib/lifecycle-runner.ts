import { cfg, TEST_EMAILS } from '@/lib/admin-stats'
import { sendLeadEmail, unsubscribeUrl, familyUnsubscribed } from '@/lib/leads'
import { buildEmail, childVars, storyVars, REPLY_TO } from '@/lib/email-system'
import { isSelfProfile, looksLikeRealName } from '@/lib/trial-emails'

/* Customer lifecycle emails that are NOT part of the trial sequence
   (lib/trial-runner.ts): payment failed, cancellation, win-back, the monthly
   customer's first weeks, signed up but never paid, the store buyer's
   day-two note, the Sunday digest and the quiet nudge.

   Runs once a day inside the lead-drip cron, after the trial emails (the
   Hobby plan allows two cron jobs and both are taken). Copy and design live
   in lib/email-system.

   THE SAFETY RULE: nothing here reaches back in time. Every rule only looks
   at something that happened on or after LAUNCH, so switching this on did
   not email past cancellations, old failed payments or old unpaid accounts.
   The two recurring emails (Sunday digest, quiet nudge) go to families who
   are using the app now and honour the parent dashboard's toggles.

   Every send is claimed in email_log under an "lc:" key and never repeats.
   ?dry=1 on /api/trial-emails reports what would send without sending. */

const LAUNCH = Date.UTC(2026, 10, 17) // Nov 17, 2026
const DAY = 86400_000
const MAX_PER_RUN = 150

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY

async function supa(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: { apikey: SUPABASE_KEY || '', Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  })
}

// PostgREST caps a response at 1,000 rows; page until a short page comes back.
async function supaAll<T>(path: string): Promise<T[]> {
  const out: T[] = []
  for (let offset = 0; ; offset += 1000) {
    const res = await supa(`${path}${path.includes('?') ? '&' : '?'}limit=1000&offset=${offset}`)
    if (!res.ok) throw new Error(`supabase ${res.status} on ${path.split('?')[0]}`)
    const rows = (await res.json()) as T[]
    out.push(...rows)
    if (rows.length < 1000) return out
  }
}

// Stripe lists are capped at 100 a page; follow has_more to the end.
async function stripeAll<T extends { id: string }>(path: string): Promise<T[]> {
  const key = await cfg('STRIPE_READONLY_KEY')
  const out: T[] = []
  let after = ''
  for (let page = 0; page < 50; page++) {
    const res = await fetch(`https://api.stripe.com/v1/${path}${path.includes('?') ? '&' : '?'}limit=100${after}`, { headers: { Authorization: `Bearer ${key}` } })
    if (!res.ok) throw new Error(`Stripe ${res.status} on ${path.split('?')[0]}`)
    const body = (await res.json()) as { data: T[]; has_more: boolean }
    out.push(...body.data)
    if (!body.has_more || !body.data.length) break
    after = `&starting_after=${body.data[body.data.length - 1].id}`
  }
  return out
}

interface Family {
  id: string
  parent_email: string | null
  parent_name: string | null
  email_notifications: unknown
  subscription_status: string | null
  stripe_customer_id: string | null
  created_at: string
}
interface Sub {
  id: string
  status: string
  customer: string
  created: number
  trial_end: number | null
  cancel_at_period_end: boolean
  cancel_at: number | null
  canceled_at: number | null
  ended_at: number | null
  current_period_end?: number
  items: { data: { current_period_end?: number; price: { recurring?: { interval: string } } }[] }
}
interface Invoice {
  id: string
  customer: string
  subscription: string | null
  attempt_count: number
  created: number
  next_payment_attempt: number | null
}
interface Planned {
  family: Family
  key: string // dedupe key in email_log
  template: string
  vars: Record<string, string>
  replaceText?: [string, string]
  replace?: Parameters<typeof buildEmail>[2] extends infer O ? (O extends { replace?: infer R } ? R : never) : never
  reason: string
}

const longDate = (ms: number) => new Date(ms).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })
const shortDate = (ms: number) => new Date(ms).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/New_York' })
const firstName = (f: Family) => (f.parent_name || '').trim().split(/\s+/)[0] || 'there'
const live = (f: Family) => ['active', 'trialing'].includes(f.subscription_status || '')
const between = (ms: number, fromDays: number, toDays: number) => ms >= fromDays * DAY && ms < toDays * DAY

interface Activity { kidNames: string[]; stories: number; stars: number; streak: number }
async function activityOf(familyId: string, sinceMs = 0): Promise<Activity> {
  const kids = (await (await supa(`/kids?select=id,name&family_id=eq.${familyId}`)).json()) as { id: string; name: string }[]
  const ids = kids.map((k) => k.id)
  if (!ids.length) return { kidNames: [], stories: 0, stars: 0, streak: 0 }
  const since = sinceMs ? `&updated_at=gte.${new Date(sinceMs).toISOString()}` : ''
  const prog = (await (await supa(`/episode_progress?select=quiz_score&watched=is.true&kid_id=in.(${ids.join(',')})${since}`)).json()) as { quiz_score: number | null }[]
  const kp = (await (await supa(`/kid_progress?select=streak_current&kid_id=in.(${ids.join(',')})`)).json()) as { streak_current: number | null }[]
  return {
    kidNames: kids.map((k) => k.name).filter(Boolean),
    stories: prog.length,
    stars: prog.reduce((n, r) => n + (Number(r.quiz_score) || 0), 0),
    streak: Math.max(0, ...kp.map((r) => Number(r.streak_current) || 0)),
  }
}
function childOf(a: Activity): Record<string, string> {
  const kids = a.kidNames.filter((n) => !isSelfProfile(n))
  return childVars(kids.length === 1 && looksLikeRealName(kids[0]) ? kids[0].trim() : null)
}
// Only numbers worth showing: a zero is not a celebration.
function statsBlock(a: Activity): ['stats', [string, string][]] {
  const v = storyVars(a.stories)
  const cells: [string, string][] = [[v.stories, v.stories_label]]
  if (a.stars > 0) cells.push([String(a.stars), 'quiz stars'])
  if (a.streak > 1) cells.push([String(a.streak), 'day streak'])
  return ['stats', cells]
}

async function plan(now: number): Promise<Planned[]> {
  const out: Planned[] = []
  const families = await supaAll<Family>('/families?select=id,parent_email,parent_name,email_notifications,subscription_status,stripe_customer_id,created_at')
  const byCustomer = new Map(families.filter((f) => f.stripe_customer_id).map((f) => [f.stripe_customer_id as string, f]))
  const usable = (f: Family | undefined): f is Family => !!f?.parent_email && !TEST_EMAILS.has(f.parent_email.toLowerCase())
  const optedIn = (f: Family) => !familyUnsubscribed(f.email_notifications)

  // ---------------- Stripe subscriptions ----------------
  const subs = await stripeAll<Sub>('subscriptions?status=all')
  const liveCustomers = new Set(subs.filter((s) => ['active', 'trialing', 'past_due'].includes(s.status)).map((s) => s.customer))
  for (const s of subs) {
    const f = byCustomer.get(s.customer)
    if (!usable(f)) continue
    const yearly = s.items.data[0]?.price.recurring?.interval === 'year'
    const periodEnd = (s.current_period_end || s.items.data[0]?.current_period_end || s.cancel_at || 0) * 1000
    const paidPlan = !s.trial_end || (s.ended_at || now / 1000) > s.trial_end + 86400 // not a trial that simply ran out
    const base = { parent: firstName(f) }

    // Cancellation confirmed (trial cancellations belong to the trial runner).
    if (s.status === 'active' && s.cancel_at_period_end && (s.canceled_at || 0) * 1000 >= LAUNCH && periodEnd > now) {
      out.push({
        family: f, key: `lc:cancel1:${s.id}`, template: 'cancel/1', reason: 'set to cancel at period end',
        vars: { ...base, access_end_date: longDate(periodEnd), access_end_short: shortDate(periodEnd) },
        ...(yearly ? { replaceText: ['Your monthly plan will end on', 'Your plan will end on'] as [string, string] } : {}),
      })
    }
    const endedMs = (s.ended_at || 0) * 1000
    if (s.status === 'canceled' && endedMs >= LAUNCH && paidPlan && !live(f) && !liveCustomers.has(s.customer)) {
      const since = now - endedMs
      // Access has ended.
      if (since < 4 * DAY) {
        out.push({
          family: f, key: `lc:cancel2:${s.id}`, template: 'cancel/2', reason: 'paid plan ended', vars: base,
          ...(yearly ? { replaceText: ['Your monthly access has ended.', 'Your access has ended.'] as [string, string] } : {}),
        })
      }
      // Win-back: a gift at 30 days, one last note at 90. Marketing, so opt-outs are honoured.
      if (optedIn(f) && between(since, 30, 37)) out.push({ family: f, key: `lc:winback1:${s.id}`, template: 'winback/1', vars: {}, reason: '30 days after plan ended' })
      if (optedIn(f) && between(since, 90, 97)) out.push({ family: f, key: `lc:winback2:${s.id}`, template: 'winback/2', vars: {}, reason: '90 days after plan ended' })
    }

    // A monthly customer's first weeks (the day-one nudge is the trial runner's never_watched).
    if (s.status === 'active' && !s.cancel_at_period_end && optedIn(f)) {
      const age = now - s.created * 1000
      const paidFor = s.trial_end ? now - s.trial_end * 1000 : age // time as a paying customer
      const fresh = s.created * 1000 >= LAUNCH
      const due = !s.trial_end && fresh && between(age, 3, 5) ? 'monthly/2' : !s.trial_end && fresh && between(age, 7, 9) ? 'monthly/3' : fresh && between(paidFor, 21, 24) ? 'monthly/4' : null
      if (due) {
        const a = await activityOf(f.id)
        if (a.stories > 0) {
          out.push({
            family: f, key: `lc:${due.replace('/', '')}`, template: due, reason: `${due} for an active customer`,
            vars: { ...base, ...childOf(a), ...storyVars(a.stories), stars: String(a.stars), streak: String(a.streak) },
            ...(due === 'monthly/3' ? { replace: { stats: statsBlock(a) } } : {}),
          })
        }
      }
    }
  }

  // ---------------- Failed payments ----------------
  const logged = async (familyId: string, key: string): Promise<number | null> => {
    const rows = (await (await supa(`/email_log?select=sent_at&family_id=eq.${familyId}&email_type=eq.${encodeURIComponent(key)}&limit=1`)).json()) as { sent_at: string }[]
    return rows[0] ? new Date(rows[0].sent_at).getTime() : null
  }
  for (const inv of await stripeAll<Invoice>('invoices?status=open')) {
    const f = byCustomer.get(inv.customer)
    if (!usable(f) || !inv.subscription || inv.attempt_count < 1 || inv.created * 1000 < LAUNCH) continue
    const base = { parent: firstName(f) }
    const first = await logged(f.id, `lc:dunning1:${inv.id}`)
    if (first === null) {
      out.push({ family: f, key: `lc:dunning1:${inv.id}`, template: 'dunning/1', vars: base, reason: 'payment failed' })
      continue
    }
    const second = await logged(f.id, `lc:dunning2:${inv.id}`)
    if (second === null) {
      if (now - first >= 3 * DAY) out.push({ family: f, key: `lc:dunning2:${inv.id}`, template: 'dunning/2', vars: base, reason: 'payment still unpaid after 3 days' })
      continue
    }
    // Only when Stripe has a real next attempt scheduled; never an invented date.
    const next = (inv.next_payment_attempt || 0) * 1000
    if (next > now && next - now < 2.5 * DAY) {
      out.push({
        family: f, key: `lc:dunning3:${inv.id}`, template: 'dunning/3', reason: 'final retry coming',
        vars: { ...base, retry_date: longDate(next), verified_access_consequence: 'If that attempt does not go through either, your subscription may be canceled, and access would end.' },
      })
    }
  }

  // ---------------- Signed up, never paid ----------------
  for (const f of families) {
    const created = new Date(f.created_at).getTime()
    if (created < LAUNCH || !usable(f) || !optedIn(f)) continue
    if (f.stripe_customer_id || !['none', '', null].includes(f.subscription_status)) continue
    const age = now - created
    const step = between(age, 2, 4) ? 'nopay/2' : between(age, 6, 8) ? 'nopay/3' : null
    if (!step) continue
    // Paid with this email but never linked? That is a support case, not a sales email.
    const cust = await stripeAll<{ id: string }>(`customers?email=${encodeURIComponent(f.parent_email as string)}`)
    if (cust.some((c) => liveCustomers.has(c.id))) continue
    out.push({ family: f, key: `lc:${step.replace('/', '')}`, template: step, vars: {}, reason: `${step}: account with no plan` })
  }

  // ---------------- Store buyers, day two of the trial ----------------
  const byId = new Map(families.map((f) => [f.id, f]))
  const storeWelcomes = await supaAll<{ family_id: string; sent_at: string }>(`/email_log?select=family_id,sent_at&email_type=eq.${encodeURIComponent('lc:store1')}&sent_at=gte.${new Date(now - 4 * DAY).toISOString()}`)
  for (const row of storeWelcomes) {
    const f = byId.get(row.family_id)
    if (!usable(f) || f.subscription_status !== 'trialing' || !optedIn(f)) continue
    if (!between(now - new Date(row.sent_at).getTime(), 2, 4)) continue
    const a = await activityOf(f.id)
    if (!a.stories) continue
    out.push({ family: f, key: 'lc:store2', template: 'store/2', reason: 'store trial, day two', vars: { parent: firstName(f), ...childOf(a), ...storyVars(a.stories), stars: String(a.stars), streak: String(a.streak) }, replace: { stats: statsBlock(a) } })
  }

  // ---------------- Sunday digest and the quiet nudge ----------------
  const prefs = (f: Family) => (f.email_notifications && typeof f.email_notifications === 'object' ? (f.email_notifications as Record<string, unknown>) : {})
  const kidFamily = async (kidIds: string[]) => {
    const map = new Map<string, string>()
    for (let i = 0; i < kidIds.length; i += 150) {
      const rows = (await (await supa(`/kids?select=id,family_id&id=in.(${kidIds.slice(i, i + 150).join(',')})`)).json()) as { id: string; family_id: string }[]
      rows.forEach((r) => map.set(r.id, r.family_id))
    }
    return map
  }
  const recent = await supaAll<{ kid_id: string; updated_at: string }>(`/episode_progress?select=kid_id,updated_at&watched=is.true&updated_at=gte.${new Date(now - 7 * DAY).toISOString()}`)
  const kf = await kidFamily([...new Set(recent.map((r) => r.kid_id))])
  const lastActive = new Map<string, number>()
  for (const r of recent) {
    const fam = kf.get(r.kid_id)
    if (fam) lastActive.set(fam, Math.max(lastActive.get(fam) || 0, new Date(r.updated_at).getTime()))
  }
  const sunday = new Date(now).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' }) === 'Sunday'
  const today = new Date(now).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  for (const [famId, last] of lastActive) {
    const f = byId.get(famId)
    if (!usable(f) || !live(f) || !optedIn(f)) continue
    if (sunday && prefs(f).weekly_digest !== false) {
      const a = await activityOf(f.id, now - 7 * DAY)
      if (a.stories > 0) {
        out.push({
          family: f, key: `lc:weekly:${today}`, template: 'progress/weekly', reason: 'Sunday digest',
          vars: { parent: firstName(f), ...childOf(a), ...storyVars(a.stories), stars: String(a.stars), streak: String(a.streak) },
          replace: { stats: statsBlock(a) },
          // We do not know which story to ask about by name, so ask about the week.
          replaceText: ['{{Child}} watched {{episode_title}} this week. Try asking: “{{question}}”', 'Ask {{child}} to tell you about one story from this week, as if you’ve never heard it.'],
        })
      }
    }
    // Quiet for five days: one gentle note, once per lapse.
    if (prefs(f).inactivity_reminder !== false && between(now - last, 5, 6)) {
      const a = await activityOf(f.id)
      out.push({ family: f, key: `lc:quiet:${new Date(last).toISOString().slice(0, 10)}`, template: 'progress/quiet', reason: 'no story for five days', vars: { parent: firstName(f), ...childOf(a) } })
    }
  }
  return out
}

export interface LifecycleResult { due: number; results: Record<string, string>[] }

export async function runLifecycleEmails(dry = false, now = Date.now()): Promise<LifecycleResult> {
  const planned = await plan(now)
  const results: Record<string, string>[] = []
  let sent = 0
  for (const p of planned) {
    const email = p.family.parent_email as string
    const row = { email, template: p.template, reason: p.reason }
    try {
      // Claimed already? Then it has been sent.
      const seen = await supa(`/email_log?select=id&family_id=eq.${p.family.id}&email_type=eq.${encodeURIComponent(p.key)}&limit=1`)
      if (seen.ok && ((await seen.json()) as unknown[]).length) continue
      const e = buildEmail(p.template, p.vars, {
        unsubscribeUrl: unsubscribeUrl(email), // ignored by billing templates
        ...(p.replace ? { replace: p.replace } : {}),
        ...(p.replaceText ? { replaceText: p.replaceText } : {}),
      })
      if (dry) { results.push({ ...row, subject: e.subject, sent: 'DRY RUN' }); continue }
      if (sent >= MAX_PER_RUN) { results.push({ ...row, sent: 'HELD: daily cap reached' }); continue }
      const ok = await sendLeadEmail(email, e.subject, e.html, e.from, REPLY_TO)
      if (ok) {
        sent++
        await supa('/email_log', { method: 'POST', body: JSON.stringify({ family_id: p.family.id, email_type: p.key, sent_to: email }) })
      }
      results.push({ ...row, sent: ok ? 'yes' : 'FAILED' })
    } catch (err) {
      // One family's email failing must not stop the rest.
      results.push({ ...row, sent: `ERROR: ${err instanceof Error ? err.message : err}` })
    }
  }
  return { due: results.length, results }
}
