import { NextRequest, NextResponse } from 'next/server'
import { computeRangeStats, loadSnapshots, todayNY, addDays } from '@/lib/admin-stats'

export const maxDuration = 120

// Dashboard data. ?range=today|yesterday|7d|30d|all
// Returns live (deduplicated) stats for the range + the daily snapshot history.
export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password') || ''
  if (!process.env.CAS_ADMIN_PASSWORD || pw !== process.env.CAS_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const range = req.nextUrl.searchParams.get('range') || 'today'
  const today = todayNY()
  let start = today
  let end = today
  let endNow = false
  if (range === 'today') { endNow = true }
  else if (range === 'yesterday') { start = end = addDays(today, -1) }
  else if (range === '7d') { start = addDays(today, -6); endNow = true }
  else if (range === '30d') { start = addDays(today, -29); endNow = true }
  else if (range === 'all') { start = '2026-04-04'; endNow = true }
  else return NextResponse.json({ error: 'Bad range' }, { status: 400 })

  try {
    const [live, history] = await Promise.all([
      computeRangeStats(start, end, endNow),
      loadSnapshots(),
    ])
    return NextResponse.json({ range, live, history })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'collect failed' },
      { status: 500 }
    )
  }
}
