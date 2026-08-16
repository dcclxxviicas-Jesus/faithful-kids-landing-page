import { NextRequest, NextResponse } from 'next/server'
import { adminPassword, computeDayStats, saveSnapshot, todayNY, addDays } from '@/lib/admin-stats'

export const maxDuration = 300

// Nightly cron (vercel.json): snapshots yesterday, and re-snapshots the three
// days before it so late-arriving GSC data (2-3 day lag) gets backfilled.
// Also callable manually: /api/cas-admin/collect?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const pw = req.nextUrl.searchParams.get('password') || req.headers.get('x-admin-password') || ''
  const expected = await adminPassword()
  // Vercel cron requests carry this UA; CRON_SECRET only exists if the
  // project has it configured. Worst case for a spoofed UA is an idempotent
  // re-collection, which is harmless.
  const cronOk =
    req.headers.get('user-agent')?.startsWith('vercel-cron/') ||
    (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`)
  const pwOk = expected && pw === expected
  if (!cronOk && !pwOk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requested = req.nextUrl.searchParams.get('date')
  const yesterday = addDays(todayNY(), -1)
  // Manual: just the requested date. Cron: yesterday + 3 days of GSC backfill.
  const days = requested ? [requested] : [yesterday, addDays(yesterday, -1), addDays(yesterday, -2), addDays(yesterday, -3)]

  const results: Record<string, string> = {}
  for (const day of days) {
    try {
      const stats = await computeDayStats(day)
      await saveSnapshot(day, stats)
      results[day] = `ok (${stats.traffic.visitors} visitors, gsc ${stats.gsc ? 'yes' : 'pending'})`
    } catch (err) {
      results[day] = `error: ${err instanceof Error ? err.message : String(err)}`
    }
  }
  return NextResponse.json({ results })
}
