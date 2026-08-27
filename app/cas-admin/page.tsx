'use client'

import { useCallback, useEffect, useState } from 'react'

// ---- types mirroring lib/admin-stats.ts RangeStats ----
interface Traffic {
  visitors: number; new_visitors: number; returning_visitors: number
  pageviews: number; sessions: number; bounce_rate: number
  avg_session_seconds: number; pages_per_session: number
  funnel: { quiz_visitors: number; quiz_started: number; quiz_answered: number; quiz_completed: number; plan_selected: number; checkout_clicked: number }
  conversion_events: { sign_up: number; trial_started: number; purchase_completed: number; subscription_canceled: number; payment_failed: number }
  events_breakdown: { event: string; count: number; uniques: number }[]
  top_pages: { path: string; visitors: number; views: number }[]
  referrers: { ref: string; visitors: number }[]
  // Optional: absent in snapshots taken before the AEO segment was added.
  ai_referrers?: { ref: string; visitors: number }[]
  devices: { device: string; visitors: number }[]
  countries: { country: string; visitors: number }[]
}
interface Gsc {
  clicks: number; impressions: number; ctr: number; position: number
  top_queries: { query: string; clicks: number; impressions: number; position: number }[]
  top_pages: { page: string; clicks: number; impressions: number; position: number }[]
}
interface StripeStats {
  range: {
    all: { trials_started: number; subs_created: number; canceled: number }
    organic: { trials_started: number; subs_created: number; canceled: number; revenue: number; purchases: number }
    revenue: number; checkout_sessions_expired: number
  }
  now: {
    active: number; trialing: number; organic_active: number; organic_trialing: number
    organic_paying: number; mrr: number; organic_mrr: number
    revenue_alltime: number; organic_revenue_alltime: number; open_payment_failures: number
  }
}
interface AppStats {
  total_families: number; new_families: number; total_kids: number; new_kids: number
  total_leads: number; new_leads: number
  recent_leads: { email: string; magnet: string; source: string; source_post: string | null; created_at: string }[]
}
interface RangeStats {
  start_day: string; end_day: string; collected_at: string
  traffic: Traffic; gsc: Gsc | null; stripe: StripeStats | null; app: AppStats | null
}
interface ApiPayload { range: string; live: RangeStats; prev: RangeStats | null; history: { day: string; data: RangeStats }[] }

const RANGES = [
  { key: 'today', label: 'Today', vs: 'yesterday at this time' },
  { key: 'yesterday', label: 'Yesterday', vs: 'the day before' },
  { key: '7d', label: 'Last 7 days', vs: 'the 7 days before' },
  { key: '30d', label: 'Last 30 days', vs: 'the 30 days before' },
  { key: 'all', label: 'All time', vs: '' },
] as const

function fmt(n: number | undefined | null): string { return (n ?? 0).toLocaleString('en-US') }
function money(n: number | undefined | null): string {
  const v = n ?? 0
  return '$' + (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
}

function Delta({ now, before }: { now: number; before: number | undefined }) {
  if (before === undefined || (before === 0 && now === 0)) return null
  if (before === 0) return <span className="delta up">new</span>
  const pct = Math.round(((now - before) / before) * 100)
  if (pct === 0) return <span className="delta flat">even</span>
  return <span className={`delta ${pct > 0 ? 'up' : 'down'}`}>{pct > 0 ? '▲' : '▼'} {Math.abs(pct)}%</span>
}

function Bar({ label, value, max, note }: { label: string; value: number; max: number; note?: string }) {
  const w = max > 0 ? Math.max((value / max) * 100, value > 0 ? 1.5 : 0) : 0
  return (
    <div className="bar">
      <div className="bar-top"><span className="bar-label">{label}</span><span className="bar-val">{fmt(value)}{note ? <em>{note}</em> : null}</span></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${w}%` }} /></div>
    </div>
  )
}

export default function CasAdmin() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [range, setRange] = useState<string>('today')
  const [data, setData] = useState<ApiPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (password: string, r: string) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/cas-admin/stats?range=${r}`, { headers: { 'x-admin-password': password } })
      if (res.status === 401) { setAuthed(false); localStorage.removeItem('casAdminPw'); setError('Wrong password'); return }
      if (!res.ok) throw new Error((await res.json()).error || `Error ${res.status}`)
      setData(await res.json())
      setAuthed(true)
      localStorage.setItem('casAdminPw', password)
      // Anyone who can open this dashboard is us, not a visitor. Register a
      // PostHog super-property so every future event from this browser is
      // flagged and can be filtered out of the numbers. Survives navigation
      // and IP changes, which matters because our IPs rotate on mobile.
      try {
        const ph = (window as unknown as { posthog?: { register?: (p: Record<string, unknown>) => void } }).posthog
        ph?.register?.({ internal: true })
        localStorage.setItem('fk_internal', '1')
      } catch {
        // never let analytics tagging break the dashboard
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('casAdminPw')
    if (saved) { setPw(saved); load(saved, 'today') }
  }, [load])

  const live = data?.live
  const prev = data?.prev
  const t = live?.traffic
  const p = prev?.traffic
  const g = live?.gsc
  const s = live?.stripe
  const a = live?.app
  const rangeMeta = RANGES.find((r) => r.key === range)
  const history = (data?.history || []).slice().sort((x, y) => x.day.localeCompare(y.day))
  const trend = history.slice(-30)
  const trendMax = Math.max(...trend.map((h) => h.data.traffic?.visitors ?? 0), 1)
  const realLeads = a?.recent_leads?.filter((l) => !l.email.startsWith('cristo7005')) ?? []

  // One-sentence summary of the selected range
  const verdict = t ? (() => {
    const bits: string[] = [`${fmt(t.visitors)} ${t.visitors === 1 ? 'person' : 'people'} visited`]
    if (p && p.visitors > 0) {
      const pct = Math.round(((t.visitors - p.visitors) / p.visitors) * 100)
      if (pct !== 0) bits[0] += ` — ${pct > 0 ? 'up' : 'down'} ${Math.abs(pct)}% vs ${rangeMeta?.vs}`
    }
    if (realLeads.length) bits.push(`you captured ${realLeads.length} email${realLeads.length > 1 ? 's' : ''}`)
    if (s && s.range.organic.revenue > 0) bits.push(`you collected ${money(s.range.organic.revenue)}`)
    else if (s && s.range.organic.trials_started > 0) bits.push(`${s.range.organic.trials_started} free trial${s.range.organic.trials_started > 1 ? 's' : ''} started`)
    return bits.join(', ') + '.'
  })() : ''

  return (
    <div className="root">
      <style>{CSS}</style>

      {!authed ? (
        <form className="gate" onSubmit={(e) => { e.preventDefault(); load(pw, range) }}>
          <h1>Faithful Kids</h1>
          <input type="password" placeholder="Password" value={pw} autoFocus onChange={(e) => setPw(e.target.value)} />
          <button type="submit" disabled={loading}>{loading ? 'Checking…' : 'Enter'}</button>
          {error ? <p className="err">{error}</p> : null}
        </form>
      ) : (
        <main>
          <header className="head">
            <h1>Faithful Kids</h1>
            <div className="tabs">
              {RANGES.map((r) => (
                <button key={r.key} className={range === r.key ? 'on' : ''} onClick={() => { setRange(r.key); load(pw, r.key) }}>
                  {r.label}
                </button>
              ))}
            </div>
          </header>

          {loading ? <div className="loadbar" /> : null}
          {error ? <p className="err">{error}</p> : null}

          {t ? (
            <div className={loading ? 'faded' : ''}>
              <p className="verdict">{verdict}</p>

              <section className="tiles">
                <div className="tile">
                  <div className="t-label">Visitors <Delta now={t.visitors} before={p?.visitors} /></div>
                  <div className="t-value">{fmt(t.visitors)}</div>
                  <div className="t-sub">{fmt(t.new_visitors)} first-timers</div>
                </div>
                <div className="tile">
                  <div className="t-label">Pageviews <Delta now={t.pageviews} before={p?.pageviews} /></div>
                  <div className="t-value">{fmt(t.pageviews)}</div>
                  <div className="t-sub">{t.bounce_rate}% read one page and left</div>
                </div>
                <div className="tile">
                  <div className="t-label">Emails captured <Delta now={realLeads.length} before={undefined} /></div>
                  <div className="t-value">{fmt(realLeads.length)}</div>
                  <div className="t-sub">{fmt(a?.total_leads)} on the list total</div>
                </div>
                <div className="tile">
                  <div className="t-label">Money collected</div>
                  <div className="t-value">{s ? money(s.range.organic.revenue) : '—'}</div>
                  <div className="t-sub">{s ? `${money(s.now.organic_revenue_alltime)} all-time from real customers` : ''}</div>
                </div>
              </section>

              <section className="panel">
                <h2>Visitors, day by day</h2>
                <p className="note">Last 30 recorded days. Bars appear the morning after each day ends.</p>
                {trend.length >= 2 ? (
                  <div className="trend">
                    {trend.map((h) => {
                      const v = h.data.traffic?.visitors ?? 0
                      return (
                        <div key={h.day} className="trend-col" title={`${h.day}: ${fmt(v)} visitors`}>
                          <div className="trend-bar" style={{ height: `${Math.max((v / trendMax) * 100, v > 0 ? 2 : 0)}%` }} />
                        </div>
                      )
                    })}
                  </div>
                ) : <p className="note">History is still filling in — check back after tonight&apos;s run.</p>}
                {trend.length >= 2 ? (
                  <div className="trend-x"><span>{trend[0].day}</span><span>peak {fmt(trendMax)}</span><span>{trend[trend.length - 1].day}</span></div>
                ) : null}
              </section>

              <div className="cols">
                <section className="panel">
                  <h2>Where visitors came from</h2>
                  {t.referrers.slice(0, 8).map((r) => (
                    <Bar key={r.ref} label={r.ref === '$direct' ? 'Typed the address / unknown' : r.ref.replace('www.', '')} value={r.visitors} max={t.referrers[0]?.visitors || 1} />
                  ))}
                  {(t.ai_referrers ?? []).length > 0 && (
                    <>
                      {/* Small numbers by design: this is the AEO leading
                          indicator, shown even when it would never make the
                          top-8 list above. */}
                      <h2 style={{ marginTop: 16 }}>Sent by an AI answer</h2>
                      {(t.ai_referrers ?? []).map((r) => (
                        <Bar key={r.ref} label={r.ref.replace('www.', '')} value={r.visitors} max={(t.ai_referrers ?? [])[0]?.visitors || 1} />
                      ))}
                    </>
                  )}
                </section>
                <section className="panel">
                  <h2>What they read</h2>
                  {t.top_pages.slice(0, 8).map((pg) => (
                    <Bar key={pg.path} label={pg.path === '/' ? 'homepage' : pg.path.replace('/blog/', '')} value={pg.visitors} max={t.top_pages[0]?.visitors || 1} />
                  ))}
                </section>
              </div>

              <section className="panel">
                <h2>Google search</h2>
                {g ? (
                  <>
                    <p className="statline">
                      <strong>{fmt(g.clicks)}</strong> clicks from <strong>{fmt(g.impressions)}</strong> times shown
                      · {g.ctr}% clicked · average spot #{Math.round(g.position)}
                      {prev?.gsc ? <Delta now={g.clicks} before={prev.gsc.clicks} /> : null}
                    </p>
                    <table className="tbl">
                      <thead><tr><th>What people searched</th><th>Clicks</th><th>Shown</th><th>Your spot</th></tr></thead>
                      <tbody>
                        {g.top_queries.slice(0, 10).map((q) => (
                          <tr key={q.query}><td>{q.query}</td><td className="num">{fmt(q.clicks)}</td><td className="num dim">{fmt(q.impressions)}</td><td className="num dim">#{Math.round(q.position)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className="note">Google hasn&apos;t reported {range === 'today' ? 'today' : 'this period'} yet — their data runs 2–3 days behind. Switch to &ldquo;Last 7 days&rdquo; or &ldquo;Last 30 days&rdquo; to see it.</p>
                )}
              </section>

              <section className="panel">
                <h2>From visit to payment</h2>
                {(() => {
                  const f = t.funnel
                  const max = Math.max(f.quiz_visitors, 1)
                  const pctOf = (n: number, d: number) => (d > 0 ? ` · ${Math.round((n / d) * 100)}% of previous` : '')
                  return (
                    <>
                      <Bar label="Opened the quiz" value={f.quiz_visitors} max={max} note={t.visitors ? ` · ${Math.round((f.quiz_visitors / t.visitors) * 1000) / 10}% of all visitors` : ''} />
                      <Bar label="Answered questions" value={f.quiz_answered} max={max} note={pctOf(f.quiz_answered, f.quiz_visitors)} />
                      <Bar label="Finished the quiz" value={f.quiz_completed} max={max} note={pctOf(f.quiz_completed, f.quiz_answered)} />
                      <Bar label="Clicked checkout" value={f.checkout_clicked} max={max} note={pctOf(f.checkout_clicked, f.quiz_completed)} />
                      <Bar label="Started a free trial" value={s?.range.organic.trials_started ?? 0} max={max} />
                      <Bar label="Paid" value={s?.range.organic.purchases ?? 0} max={max} note={s && s.range.organic.revenue > 0 ? ` · ${money(s.range.organic.revenue)}` : ''} />
                    </>
                  )
                })()}
                {s && s.range.checkout_sessions_expired > 0 ? (
                  <p className="warn">⚠ {s.range.checkout_sessions_expired} {s.range.checkout_sessions_expired === 1 ? 'person' : 'people'} reached the Stripe payment page and left without paying.</p>
                ) : null}
              </section>

              {s ? (
                <section className="panel">
                  <h2>The business</h2>
                  <p className="note">Your own test and family accounts are excluded from these numbers.</p>
                  <div className="facts">
                    <div><strong>{fmt(s.now.organic_paying)}</strong> paying {s.now.organic_paying === 1 ? 'customer' : 'customers'}</div>
                    <div><strong>{fmt(s.now.organic_trialing)}</strong> on free trials right now</div>
                    <div><strong>{money(s.now.organic_revenue_alltime)}</strong> collected all-time</div>
                    <div><strong>{fmt(a?.total_families)}</strong> app accounts · <strong>{fmt(a?.total_kids)}</strong> kid profiles</div>
                    {s.range.organic.canceled > 0 ? <div className="bad"><strong>{s.range.organic.canceled}</strong> canceled in this period</div> : null}
                    {s.now.open_payment_failures > 0 ? <div className="bad"><strong>{s.now.open_payment_failures}</strong> customer{s.now.open_payment_failures > 1 ? 's have' : ' has'} a failing card</div> : null}
                  </div>
                </section>
              ) : null}

              <section className="panel">
                <h2>Emails captured{realLeads.length ? ` (${realLeads.length})` : ''}</h2>
                {realLeads.length ? (
                  <table className="tbl">
                    <tbody>
                      {realLeads.map((l) => (
                        <tr key={l.email + l.created_at}>
                          <td><strong>{l.email}</strong></td>
                          <td className="dim">downloaded the {l.magnet.replace('-', ' ')}</td>
                          <td className="dim">from {l.source_post || l.source}</td>
                          <td className="num dim">{l.created_at.slice(5, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="note">No emails captured in this period.</p>}
              </section>

              <details className="more">
                <summary>More detail — countries, devices, every tracked event</summary>
                <div className="cols">
                  <section className="panel">
                    <h2>Countries</h2>
                    {t.countries.slice(0, 8).map((c) => <Bar key={c.country} label={c.country} value={c.visitors} max={t.countries[0]?.visitors || 1} />)}
                    <p className="note" style={{ marginTop: 12 }}>
                      Devices: {t.devices.map((d) => `${d.device} ${fmt(d.visitors)}`).join(' · ')}
                    </p>
                  </section>
                  <section className="panel">
                    <h2>Every tracked event</h2>
                    <table className="tbl"><tbody>
                      {t.events_breakdown?.map((e) => (
                        <tr key={e.event}><td>{e.event}</td><td className="num">{fmt(e.count)}</td><td className="num dim">{fmt(e.uniques)} people</td></tr>
                      ))}
                    </tbody></table>
                  </section>
                </div>
              </details>

              <section className="panel">
                <h2>Daily log</h2>
                <p className="note">One row per day, saved automatically every night.</p>
                <div className="scroll">
                  <table className="tbl log">
                    <thead><tr><th>Day</th><th>Visitors</th><th>Views</th><th>Google clicks</th><th>Quiz finished</th><th>Emails</th><th>Money</th></tr></thead>
                    <tbody>
                      {history.slice().reverse().map((h) => {
                        const ht = h.data.traffic, hg = h.data.gsc, hs = h.data.stripe, ha = h.data.app
                        const rev = hs?.range?.organic?.revenue ?? 0
                        return (
                          <tr key={h.day}>
                            <td>{h.day}</td>
                            <td className="num">{fmt(ht?.visitors)}</td>
                            <td className="num dim">{fmt(ht?.pageviews)}</td>
                            <td className="num">{hg ? fmt(hg.clicks) : '…'}</td>
                            <td className="num">{fmt(ht?.funnel?.quiz_completed)}</td>
                            <td className="num">{fmt(ha?.new_leads)}</td>
                            <td className={`num${rev > 0 ? ' good' : ''}`}>{rev > 0 ? money(rev) : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <p className="foot">
                {live ? `${live.start_day}${live.end_day !== live.start_day ? ` to ${live.end_day}` : ''} · refreshed ${new Date(live.collected_at).toLocaleTimeString()} · ` : ''}
                <button className="linky" onClick={() => load(pw, range)}>refresh</button>
              </p>
            </div>
          ) : null}
        </main>
      )}
    </div>
  )
}

const CSS = `
.root { min-height: 100vh; background: #fafaf8; color: #14201b; font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
.root main { max-width: 860px; margin: 0 auto; padding: 32px 20px 90px; }
.root h1 { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; font-size: 26px; margin: 0; }
.root h2 { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; font-size: 19px; margin: 0 0 4px; }
.gate { max-width: 300px; margin: 20vh auto 0; display: grid; gap: 10px; padding: 0 20px; text-align: center; }
.gate input { padding: 11px 12px; border: 1px solid #d5dbd7; border-radius: 9px; font-size: 16px; text-align: center; }
.gate button { padding: 11px; border: 0; border-radius: 9px; background: #059669; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; }
.err { color: #b91c1c; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 8px; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; background: #eef1ef; border-radius: 999px; padding: 3px; }
.tabs button { padding: 7px 13px; border: 0; border-radius: 999px; background: transparent; font-size: 13.5px; cursor: pointer; color: #4d5b54; }
.tabs button.on { background: #fff; color: #14201b; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
.verdict { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; font-size: 21px; line-height: 1.35; margin: 18px 0 22px; max-width: 42em; }
.loadbar { height: 3px; border-radius: 2px; background: linear-gradient(90deg, #059669 30%, #d1e9df 30%); background-size: 200% 100%; animation: slide 1s linear infinite; margin: 8px 0; }
@keyframes slide { from { background-position: 0 0 } to { background-position: -200% 0 } }
.faded { opacity: 0.99; }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 14px; }
.tile { background: #fff; border: 1px solid #e5e9e6; border-radius: 12px; padding: 14px 16px; }
.t-label { font-size: 13px; color: #6b7a73; display: flex; align-items: center; gap: 8px; }
.t-value { font-size: 30px; font-weight: 700; margin-top: 2px; letter-spacing: -0.02em; }
.t-sub { font-size: 12.5px; color: #8a958f; margin-top: 3px; }
.delta { font-size: 12px; font-weight: 700; padding: 1px 7px; border-radius: 999px; }
.delta.up { color: #047857; background: #e6f4ee; }
.delta.down { color: #b91c1c; background: #fbeaea; }
.delta.flat { color: #6b7a73; background: #eef1ef; }
.panel { background: #fff; border: 1px solid #e5e9e6; border-radius: 12px; padding: 18px 20px; margin: 12px 0; }
.note { font-size: 13px; color: #8a958f; margin: 2px 0 12px; }
.warn { font-size: 13.5px; color: #92400e; background: #fef6e7; border-radius: 8px; padding: 8px 12px; margin: 12px 0 0; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 700px) { .cols { grid-template-columns: 1fr; } }
.bar { margin: 9px 0; }
.bar-top { display: flex; justify-content: space-between; gap: 10px; font-size: 13.5px; margin-bottom: 3px; }
.bar-label { color: #4d5b54; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-val { font-weight: 650; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bar-val em { font-style: normal; font-weight: 400; color: #8a958f; font-size: 12px; }
.bar-track { height: 8px; background: #eef1ef; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; background: #059669; border-radius: 4px; }
.trend { display: flex; align-items: flex-end; gap: 2px; height: 120px; }
.trend-col { flex: 1; display: flex; align-items: flex-end; height: 100%; }
.trend-bar { width: 100%; background: #059669; border-radius: 3px 3px 0 0; min-height: 0; }
.trend-x { display: flex; justify-content: space-between; font-size: 11.5px; color: #8a958f; margin-top: 6px; }
.statline { font-size: 15px; margin: 4px 0 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tbl { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.tbl th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.05em; color: #8a958f; font-weight: 600; padding: 4px 10px 6px 0; border-bottom: 1px solid #e5e9e6; }
.tbl td { padding: 6px 10px 6px 0; border-bottom: 1px solid #f0f3f1; }
.tbl tr:last-child td { border-bottom: 0; }
.num { text-align: right !important; font-variant-numeric: tabular-nums; white-space: nowrap; }
.num.good { color: #047857; font-weight: 700; }
.dim { color: #8a958f; }
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px 20px; font-size: 14.5px; }
.facts strong { font-size: 17px; }
.facts .bad { color: #b91c1c; }
.more { margin: 12px 0; }
.more summary { font-size: 13.5px; color: #6b7a73; cursor: pointer; padding: 4px 2px; }
.scroll { overflow-x: auto; }
.log th, .log td { padding-right: 14px; }
.foot { font-size: 12.5px; color: #8a958f; margin-top: 18px; }
.linky { border: 0; background: none; color: #059669; cursor: pointer; font-size: 12.5px; padding: 0; text-decoration: underline; }
`
