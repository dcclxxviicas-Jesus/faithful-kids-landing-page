// Collectors for the /cas-admin dashboard. Pulls PostHog (HogQL), Google
// Search Console, Stripe, and Supabase into one stats object, either for a
// single day (cron snapshot) or an arbitrary range (live dashboard views).
// All "days" are America/New_York calendar days.

const POSTHOG_PROJECT = '368526'
const GSC_SITE = 'sc-domain:faithfulkids.app'
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY

// Secrets live in Supabase (admin_daily_stats row day=1970-01-01, service-role
// only) so the Vercel project needs no new env vars — it already has the
// Supabase credentials for the leads system. process.env still wins when set
// (local dev uses .env.local).
const CONFIG_DAY = '1970-01-01'
let configCache: Record<string, string> | null = null

async function config(): Promise<Record<string, string>> {
  if (configCache) return configCache
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_daily_stats?day=eq.${CONFIG_DAY}&select=data`,
      { headers: { apikey: SUPABASE_KEY || '', Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const rows = res.ok ? await res.json() : []
    configCache = (rows[0]?.data?.config as Record<string, string>) || {}
  } catch {
    configCache = {}
  }
  return configCache
}

export async function cfg(name: string): Promise<string> {
  return process.env[name] || (await config())[name] || ''
}

export async function adminPassword(): Promise<string> {
  return cfg('CAS_ADMIN_PASSWORD')
}

export const ADMIN_TZ = 'America/New_York'

// Accounts excluded from "organic" numbers and from all customer email:
// build/test accounts, friends and family, and phantom subscriptions that
// sit in Stripe as "active" but whose every invoice failed (they never paid,
// so counting them as customers or MRR overstates the business).
export const TEST_EMAILS = new Set([
  'reviewer@faithfulkids.app', // directory/press reviewer test account (no Stripe)
  'cristo7005@gmail.com',
  'christianashaman@gmail.com',
  'christianshaman77@gmail.com',
  'zachjs107@gmail.com',
  'markshaman@hotmail.com',
  'dtshaman@gmail.com',
  'zooms-riper.8w@icloud.com',
  '777@gmail.com',
  // Two subscriptions, both stuck 'active', card declined on every attempt
  // in May 2026. Never paid a cent. Not a customer.
  'cathaljamescanavan@gmail.com',
])

// ---------- time helpers ----------

function tzOffsetMinutes(dayStr: string): number {
  // Offset of America/New_York from UTC at noon UTC on that date (DST-safe)
  const probe = new Date(`${dayStr}T12:00:00Z`)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ADMIN_TZ,
    timeZoneName: 'shortOffset',
  }).formatToParts(probe)
  const name = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT-4'
  const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (!m) return -240
  const sign = m[1] === '-' ? -1 : 1
  return sign * (parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0))
}

// UTC instant when this NY calendar day starts
export function dayStartUTC(dayStr: string): Date {
  return new Date(new Date(`${dayStr}T00:00:00Z`).getTime() - tzOffsetMinutes(dayStr) * 60000)
}

export function todayNY(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ADMIN_TZ }).format(new Date())
}

export function addDays(dayStr: string, n: number): string {
  const d = new Date(`${dayStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function chSql(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

// ---------- PostHog ----------

async function hogql(query: string): Promise<unknown[][]> {
  const key = await cfg('POSTHOG_PERSONAL_API_KEY')
  const res = await fetch(`https://us.posthog.com/api/projects/${POSTHOG_PROJECT}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  })
  if (!res.ok) throw new Error(`PostHog ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const json = await res.json()
  return json.results || []
}

// Exclude only traffic we can be certain is ours. Deliberately narrow:
// a page-count threshold would discard genuinely engaged readers, and the
// interlinking work exists to push pages-per-session UP, so filtering on it
// would hide the very improvement we are measuring. Likewise /privacy and
// /terms are exactly what a careful parent checks before subscribing.
// The signup funnel lives on faithfulkids.app. The APP fired a 'quiz_completed'
// of its own until 2026-09-03 (a kid finishing the 3 questions after a lesson),
// and both report into one PostHog project — so an unfiltered count added
// children finishing lessons to parents finishing the signup quiz. The app
// event is now 'episode_quiz_completed'; this guard keeps the HISTORY correct
// too, which a rename alone cannot do.
const MARKETING = "properties.$host = 'faithfulkids.app'"

const INTERNAL_PAGES = "('/cas-admin','/admin-dashboard')"

async function collectTraffic(startUTC: Date, endUTC: Date) {
  const window = `timestamp >= toDateTime('${chSql(startUTC)}') AND timestamp < toDateTime('${chSql(endUTC)}')`

  // A session is ours if it carries the internal flag (set when the admin
  // dashboard is opened) or if it visited an admin page at all.
  const ourSessions = `
    SELECT $session_id FROM events
    WHERE ${window} AND $session_id IS NOT NULL
    GROUP BY $session_id
    HAVING countIf(properties.$pathname IN ${INTERNAL_PAGES}) > 0
        OR countIf(toString(properties.internal) = 'true') > 0`

  const W = `${window}
    AND toString(coalesce(properties.internal, '')) != 'true'
    AND ($session_id IS NULL OR $session_id NOT IN (${ourSessions}))`

  const [summary] = await hogql(`
    SELECT
      count(DISTINCT distinct_id),
      countIf(event = '$pageview'),
      count(DISTINCT if(event = '$pageview' AND properties.$pathname = '/quiz', distinct_id, NULL)),
      count(DISTINCT if(event = 'quiz_started' AND ${MARKETING}, distinct_id, NULL)),
      count(DISTINCT if(event = 'quiz_answer' AND ${MARKETING}, distinct_id, NULL)),
      count(DISTINCT if(event = 'quiz_completed' AND ${MARKETING}, distinct_id, NULL)),
      count(DISTINCT if(event IN ('plan_select','quiz_plan_select'), distinct_id, NULL)),
      count(DISTINCT if(event IN ('checkout_continue','quiz_checkout_click'), distinct_id, NULL)),
      countIf(event = 'sign_up'), countIf(event = 'trial_started'),
      countIf(event = 'purchase_completed'), countIf(event = 'subscription_canceled'),
      countIf(event = 'payment_failed')
    FROM events WHERE ${W}`)

  const [sessions] = await hogql(`
    SELECT count(), countIf(pv = 1), round(avg(dur), 0)
    FROM (
      SELECT $session_id, countIf(event = '$pageview') AS pv,
             dateDiff('second', min(timestamp), max(timestamp)) AS dur
      FROM events WHERE ${W} GROUP BY $session_id HAVING pv > 0
    )`)

  const [returning] = await hogql(`
    SELECT count(DISTINCT distinct_id) FROM events
    WHERE ${W} AND distinct_id IN (
      SELECT DISTINCT distinct_id FROM events WHERE timestamp < toDateTime('${chSql(startUTC)}')
    )`)

  const topPages = await hogql(`
    SELECT properties.$pathname, count(DISTINCT distinct_id), count()
    FROM events WHERE event = '$pageview' AND ${W}
    GROUP BY 1 ORDER BY 2 DESC LIMIT 25`)

  const referrers = await hogql(`
    SELECT properties.$referring_domain, count(DISTINCT distinct_id)
    FROM events WHERE event = '$pageview' AND ${W}
    GROUP BY 1 ORDER BY 2 DESC LIMIT 15`)

  // Answer-engine referrals, tracked separately because they never crack the
  // top-15 referrer list yet are the leading indicator for AEO work (llms.txt,
  // /about, answer-first comparison posts). chatgpt.com alone sent 37 visitors
  // in the 60 days before this was added — invisible in the list above.
  // Bing/DDG excluded here: they are classic search engines; this bucket is
  // only destinations where an AI wrote the answer.
  const aiReferrers = await hogql(`
    SELECT properties.$referring_domain AS d, count(DISTINCT distinct_id)
    FROM events WHERE event = '$pageview' AND ${W}
    AND (d ILIKE '%chatgpt%' OR d ILIKE '%openai%' OR d ILIKE '%perplexity%'
         OR d ILIKE '%copilot%' OR d ILIKE '%gemini%' OR d ILIKE '%claude%'
         OR d ILIKE '%meta.ai%' OR d ILIKE '%you.com%' OR d ILIKE '%poe.com%')
    GROUP BY 1 ORDER BY 2 DESC`)

  const devices = await hogql(`
    SELECT properties.$device_type, count(DISTINCT distinct_id)
    FROM events WHERE event = '$pageview' AND ${W}
    GROUP BY 1 ORDER BY 2 DESC`)

  const countries = await hogql(`
    SELECT properties.$geoip_country_name, count(DISTINCT distinct_id)
    FROM events WHERE event = '$pageview' AND ${W}
    GROUP BY 1 ORDER BY 2 DESC LIMIT 15`)

  // Verse-CTA experiment: per-variant funnel. Shown -> clicked -> actually
  // landed on /quiz, since a click that doesn't arrive is not a conversion.
  const ctaExperiment = await hogql(`
    SELECT
      coalesce(properties.variant, 'unknown') AS variant,
      count(DISTINCT if(event = 'verse_cta_shown', $session_id, NULL)) AS shown,
      count(DISTINCT if(event = 'verse_cta_click', $session_id, NULL)) AS clicked,
      count(DISTINCT if(event = 'verse_cta_click' AND $session_id IN (
        SELECT $session_id FROM events
        WHERE event = '$pageview' AND properties.$pathname = '/quiz' AND ${window}
      ), $session_id, NULL)) AS reached_quiz
    FROM events
    WHERE ${W} AND event IN ('verse_cta_shown', 'verse_cta_click')
    GROUP BY variant ORDER BY shown DESC`)

  const eventsBreakdown = await hogql(`
    SELECT event, count(), count(DISTINCT distinct_id)
    FROM events
    WHERE ${W} AND event NOT IN ('$pageview','$pageleave','$autocapture','$web_vitals','$identify','$set','$rageclick','$recording_observed')
    GROUP BY event ORDER BY 2 DESC LIMIT 30`)

  const s = summary as number[]
  const sess = (sessions || [0, 0, 0]) as number[]
  const visitors = s[0] || 0
  const ret = ((returning || [0]) as number[])[0] || 0
  return {
    visitors,
    new_visitors: Math.max(0, visitors - ret),
    returning_visitors: ret,
    pageviews: s[1] || 0,
    sessions: sess[0] || 0,
    bounce_rate: sess[0] ? Math.round(((sess[1] || 0) / sess[0]) * 1000) / 10 : 0,
    avg_session_seconds: sess[2] || 0,
    pages_per_session: sess[0] ? Math.round(((s[1] || 0) / sess[0]) * 100) / 100 : 0,
    funnel: {
      quiz_visitors: s[2] || 0, quiz_started: s[3] || 0, quiz_answered: s[4] || 0,
      quiz_completed: s[5] || 0, plan_selected: s[6] || 0, checkout_clicked: s[7] || 0,
    },
    conversion_events: {
      sign_up: s[8] || 0, trial_started: s[9] || 0, purchase_completed: s[10] || 0,
      subscription_canceled: s[11] || 0, payment_failed: s[12] || 0,
    },
    events_breakdown: (eventsBreakdown as [string, number, number][]).map((r) => ({ event: r[0], count: r[1], uniques: r[2] })),
    cta_experiment: (ctaExperiment as [string, number, number, number][]).map((r) => ({
      variant: r[0], shown: r[1], clicked: r[2], reached_quiz: r[3],
      ctr: r[1] ? Math.round((r[2] / r[1]) * 1000) / 10 : 0,
      quiz_rate: r[1] ? Math.round((r[3] / r[1]) * 1000) / 10 : 0,
    })),
    top_pages: (topPages as [string, number, number][]).map((r) => ({ path: r[0], visitors: r[1], views: r[2] })),
    referrers: (referrers as [string, number][]).map((r) => ({ ref: r[0] || '$direct', visitors: r[1] })),
    ai_referrers: (aiReferrers as [string, number][]).map((r) => ({ ref: r[0], visitors: r[1] })),
    devices: (devices as [string, number][]).map((r) => ({ device: r[0] || 'Unknown', visitors: r[1] })),
    countries: (countries as [string, number][]).map((r) => ({ country: r[0] || 'Unknown', visitors: r[1] })),
  }
}

// ---------- Google Search Console ----------

async function gscToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: await cfg('GSC_CLIENT_ID'),
      client_secret: await cfg('GSC_CLIENT_SECRET'),
      refresh_token: await cfg('GSC_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`GSC token ${res.status}`)
  return (await res.json()).access_token
}

async function gscQuery(token: string, body: Record<string, unknown>) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) throw new Error(`GSC ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return (await res.json()).rows || []
}

// GSC dates are calendar dates in the property's timezone (PT); close enough
// to our NY day for daily reporting, and exact for multi-day ranges.
async function collectGsc(startDay: string, endDay: string) {
  try {
    const token = await gscToken()
    const base = { startDate: startDay, endDate: endDay }
    type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }
    const [totals, queries, pages] = await Promise.all([
      gscQuery(token, { ...base, rowLimit: 500, dimensions: ['date'] }),
      gscQuery(token, { ...base, rowLimit: 25, dimensions: ['query'] }),
      gscQuery(token, { ...base, rowLimit: 25, dimensions: ['page'] }),
    ])
    const clicks = (totals as Row[]).reduce((a, r) => a + r.clicks, 0)
    const imps = (totals as Row[]).reduce((a, r) => a + r.impressions, 0)
    if (imps === 0 && clicks === 0) return null // data not in yet (2-3 day lag)
    const wavg = (totals as Row[]).reduce((a, r) => a + r.position * r.impressions, 0)
    return {
      clicks,
      impressions: imps,
      ctr: imps ? Math.round((clicks / imps) * 1000) / 10 : 0,
      position: imps ? Math.round((wavg / imps) * 10) / 10 : 0,
      top_queries: (queries as Row[]).map((r) => ({
        query: r.keys[0], clicks: r.clicks, impressions: r.impressions,
        position: Math.round(r.position * 10) / 10,
      })),
      top_pages: (pages as Row[]).map((r) => ({
        page: r.keys[0].replace('https://faithfulkids.app', '') || '/',
        clicks: r.clicks, impressions: r.impressions,
        position: Math.round(r.position * 10) / 10,
      })),
    }
  } catch (err) {
    console.error('GSC collect failed:', err)
    return null
  }
}

// ---------- Stripe ----------

async function stripeList(path: string, params: Record<string, string> = {}): Promise<Record<string, unknown>[]> {
  const key = await cfg('STRIPE_READONLY_KEY')
  const out: Record<string, unknown>[] = []
  let starting_after = ''
  for (let page = 0; page < 20; page++) {
    const qs = new URLSearchParams({ limit: '100', ...params })
    if (starting_after) qs.set('starting_after', starting_after)
    const res = await fetch(`https://api.stripe.com/v1/${path}?${qs}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (!res.ok) throw new Error(`Stripe ${path} ${res.status}`)
    const json = await res.json()
    out.push(...json.data)
    if (!json.has_more) break
    starting_after = (json.data[json.data.length - 1] as { id: string }).id
  }
  return out
}

function monthly(unitAmount: number, interval: string, intervalCount: number): number {
  const per = intervalCount || 1
  if (interval === 'year') return unitAmount / (12 * per)
  if (interval === 'week') return (unitAmount * 4.345) / per
  if (interval === 'day') return (unitAmount * 30.4) / per
  return unitAmount / per
}

async function collectStripe(startUTC: Date, endUTC: Date) {
  try {
    const [subs, invoices, customers, sessions] = await Promise.all([
      stripeList('subscriptions', { status: 'all' }),
      stripeList('invoices'),
      stripeList('customers'),
      stripeList('checkout/sessions'),
    ])
    const emailOf = new Map(customers.map((c) => [c.id as string, ((c.email as string) || '').toLowerCase()]))
    const isTest = (custId: unknown) => TEST_EMAILS.has(emailOf.get(custId as string) || '')
    const t0 = startUTC.getTime() / 1000
    const t1 = endUTC.getTime() / 1000
    const inRange = (ts: unknown) => typeof ts === 'number' && ts >= t0 && ts < t1

    type Sub = {
      customer: unknown; created: number; status: string; canceled_at: number | null
      trial_end: number | null
      cancellation_details?: { reason?: string }
      items: { data: { price: { unit_amount: number; recurring?: { interval: string; interval_count: number } } }[] }
    }
    const allSubs = subs as unknown as Sub[]
    const organic = allSubs.filter((s) => !isTest(s.customer))

    const dayStats = (pool: Sub[]) => ({
      trials_started: pool.filter((s) => inRange(s.created) && s.trial_end && s.trial_end > s.created).length,
      subs_created: pool.filter((s) => inRange(s.created)).length,
      canceled: pool.filter((s) => inRange(s.canceled_at)).length,
    })

    const paidInvoices = (invoices as { amount_paid: number; customer: unknown; created: number; status_transitions?: { paid_at?: number } }[])
      .filter((i) => i.amount_paid > 0)
    const revenueIn = (pool: typeof paidInvoices) =>
      pool.filter((i) => inRange(i.status_transitions?.paid_at ?? i.created))
        .reduce((a, i) => a + i.amount_paid, 0) / 100
    const organicInvoices = paidInvoices.filter((i) => !isTest(i.customer))

    const failures = (invoices as { customer: unknown; attempt_count: number; amount_due: number; created: number; status: string; next_payment_attempt: number | null }[])
      .filter((i) => i.status === 'open' && i.attempt_count > 0)

    const expiredSessions = (sessions as { status: string; expires_at: number; customer: unknown }[])
      .filter((s) => s.status === 'expired' && inRange(s.expires_at)).length

    const mrrOf = (pool: Sub[]) =>
      Math.round(
        pool
          .filter((s) => s.status === 'active' || s.status === 'trialing')
          .reduce((a, s) => {
            const p = s.items.data[0]?.price
            return a + (p ? monthly(p.unit_amount, p.recurring?.interval || 'month', p.recurring?.interval_count || 1) : 0)
          }, 0)
      ) / 100

    return {
      range: {
        all: dayStats(allSubs),
        organic: {
          ...dayStats(organic),
          revenue: revenueIn(organicInvoices),
          purchases: organicInvoices.filter((i) => inRange(i.status_transitions?.paid_at ?? i.created)).length,
        },
        revenue: revenueIn(paidInvoices),
        checkout_sessions_expired: expiredSessions,
      },
      now: {
        active: allSubs.filter((s) => s.status === 'active').length,
        trialing: allSubs.filter((s) => s.status === 'trialing').length,
        organic_active: organic.filter((s) => s.status === 'active').length,
        organic_trialing: organic.filter((s) => s.status === 'trialing').length,
        organic_paying: organic.filter((s) => s.status === 'active').filter((s) => {
          const custInvoices = organicInvoices.filter((i) => i.customer === s.customer)
          return custInvoices.length > 0
        }).length,
        mrr: mrrOf(allSubs),
        organic_mrr: mrrOf(organic),
        revenue_alltime: paidInvoices.reduce((a, i) => a + i.amount_paid, 0) / 100,
        organic_revenue_alltime: organicInvoices.reduce((a, i) => a + i.amount_paid, 0) / 100,
        open_payment_failures: failures.filter((i) => !isTest(i.customer)).length,
      },
    }
  } catch (err) {
    console.error('Stripe collect failed:', err)
    return null
  }
}

// ---------- Supabase (app data) ----------

async function supaCount(table: string, filter = ''): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${filter}`, {
    method: 'HEAD',
    headers: {
      apikey: SUPABASE_KEY || '', Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'count=exact', Range: '0-0',
    },
  })
  const range = res.headers.get('content-range') || '0/0'
  return parseInt(range.split('/')[1] || '0', 10) || 0
}

async function collectApp(startUTC: Date, endUTC: Date) {
  try {
    const created = `&created_at=gte.${startUTC.toISOString()}&created_at=lt.${endUTC.toISOString()}`
    const [totalFamilies, newFamilies, totalKids, newKids, totalLeads, newLeads, leadRows] = await Promise.all([
      supaCount('families'), supaCount('families', created),
      supaCount('kids'), supaCount('kids', created),
      supaCount('leads'), supaCount('leads', created),
      fetch(
        `${SUPABASE_URL}/rest/v1/leads?select=email,magnet,source,source_post,created_at&created_at=gte.${startUTC.toISOString()}&created_at=lt.${endUTC.toISOString()}&order=created_at.desc&limit=25`,
        { headers: { apikey: SUPABASE_KEY || '', Authorization: `Bearer ${SUPABASE_KEY}` } }
      ).then((r) => (r.ok ? r.json() : [])),
    ])
    return {
      total_families: totalFamilies, new_families: newFamilies,
      total_kids: totalKids, new_kids: newKids,
      total_leads: totalLeads, new_leads: newLeads,
      recent_leads: leadRows as { email: string; magnet: string; source: string; source_post: string | null; created_at: string }[],
    }
  } catch (err) {
    console.error('Supabase collect failed:', err)
    return null
  }
}

// ---------- top-level ----------

export interface RangeStats {
  start_day: string
  end_day: string
  collected_at: string
  traffic: Awaited<ReturnType<typeof collectTraffic>>
  gsc: Awaited<ReturnType<typeof collectGsc>>
  stripe: Awaited<ReturnType<typeof collectStripe>>
  app: Awaited<ReturnType<typeof collectApp>>
}

// endDay inclusive; endUTCOverride lets callers truncate the window (used for
// "previous period at the same time of day" comparisons)
export async function computeRangeStats(startDay: string, endDay: string, endNow = false, endUTCOverride?: Date): Promise<RangeStats> {
  const startUTC = dayStartUTC(startDay)
  const endUTC = endUTCOverride || (endNow ? new Date() : dayStartUTC(addDays(endDay, 1)))
  const [traffic, gsc, stripe, app] = await Promise.all([
    collectTraffic(startUTC, endUTC),
    collectGsc(startDay, endDay),
    collectStripe(startUTC, endUTC),
    collectApp(startUTC, endUTC),
  ])
  return { start_day: startDay, end_day: endDay, collected_at: new Date().toISOString(), traffic, gsc, stripe, app }
}

export async function computeDayStats(day: string): Promise<RangeStats> {
  return computeRangeStats(day, day)
}

// ---------- snapshot storage ----------

export async function saveSnapshot(day: string, data: RangeStats): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_daily_stats?on_conflict=day`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY || '', Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ day, data, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error(`snapshot save ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

export async function loadSnapshots(): Promise<{ day: string; data: RangeStats }[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_daily_stats?select=day,data&day=gt.2020-01-01&order=day.desc&limit=400`, {
    headers: { apikey: SUPABASE_KEY || '', Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) return []
  return res.json()
}
