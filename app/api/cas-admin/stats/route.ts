import { NextRequest, NextResponse } from 'next/server'
import { adminPassword, computeRangeStats, loadSnapshots, todayNY, addDays } from '@/lib/admin-stats'

export const maxDuration = 120

// Dashboard data. ?range=today|yesterday|7d|30d|all
// Returns live (deduplicated) stats for the range + the daily snapshot history.
export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password') || ''
  const expected = await adminPassword()
  if (!expected || pw !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const range = req.nextUrl.searchParams.get('range') || 'today'
  const today = todayNY()
  const now = Date.now()
  let start = today
  let end = today
  let endNow = false
  // Previous comparable period, truncated to the same elapsed time for
  // partial windows ("vs yesterday at this time", "vs the 7 days before")
  let prevArgs: [string, string, boolean, Date?] | null = null
  if (range === 'today') {
    endNow = true
    prevArgs = [addDays(today, -1), addDays(today, -1), false, new Date(now - 86400_000)]
  } else if (range === 'yesterday') {
    start = end = addDays(today, -1)
    prevArgs = [addDays(today, -2), addDays(today, -2), false]
  } else if (range === '7d') {
    start = addDays(today, -6); endNow = true
    prevArgs = [addDays(today, -13), addDays(today, -7), false, new Date(now - 7 * 86400_000)]
  } else if (range === '30d') {
    start = addDays(today, -29); endNow = true
    prevArgs = [addDays(today, -59), addDays(today, -30), false, new Date(now - 30 * 86400_000)]
  } else if (range === 'all') {
    start = '2026-04-04'; endNow = true
  } else return NextResponse.json({ error: 'Bad range' }, { status: 400 })

  try {
    const [live, prev, history] = await Promise.all([
      computeRangeStats(start, end, endNow),
      prevArgs ? computeRangeStats(...prevArgs) : Promise.resolve(null),
      loadSnapshots(),
    ])
    return NextResponse.json({ range, live, prev, history })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'collect failed' },
      { status: 500 }
    )
  }
}
