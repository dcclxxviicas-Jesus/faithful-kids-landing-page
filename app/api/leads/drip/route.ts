import { NextResponse } from 'next/server'
import { getDueLeads, updateLead, sendLeadEmail } from '@/lib/leads'
import { buildEmail, DRIP_SCHEDULE } from '@/lib/lead-emails'
import { runTrialEmails } from '@/lib/trial-runner'

// Drip engine — hit daily by cron-job.org:
//   GET /api/leads/drip?secret=DRIP_SECRET
// Sends each due lead its next email and schedules the one after.

export async function GET(req: Request) {
  const url = new URL(req.url)
  // Two accepted callers: Vercel Cron (Authorization: Bearer CRON_SECRET,
  // injected automatically) and manual runs (?secret=DRIP_SECRET).
  const isVercelCron =
    !!process.env.CRON_SECRET &&
    req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`
  const isManual = url.searchParams.get('secret') === process.env.DRIP_SECRET
  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const due = await getDueLeads(50)
    let sent = 0
    let failed = 0

    for (const lead of due) {
      const stage = lead.sequence_stage + 1
      const { subject, html } = buildEmail(lead, stage)
      const ok = await sendLeadEmail(lead.email, subject, html)
      if (!ok) {
        failed++
        continue
      }
      const daysToNext = DRIP_SCHEDULE[stage]
      await updateLead(lead.email, {
        sequence_stage: stage,
        next_send_at: daysToNext ? new Date(Date.now() + daysToNext * 86400_000).toISOString() : null,
      })
      sent++
    }

    // Second job on the same daily tick: trial lifecycle emails. The Hobby
    // plan allows only two cron entries and both are spoken for, so this
    // rides along here. Isolated so a trial-email failure can never stop the
    // lead drip from reporting success.
    let trial: unknown = { skipped: true }
    try {
      trial = await runTrialEmails()
    } catch (e) {
      console.error('trial emails failed:', e)
      trial = { error: e instanceof Error ? e.message : 'failed' }
    }

    return NextResponse.json({ ok: true, due: due.length, sent, failed, trial })
  } catch (e) {
    console.error('drip error:', e)
    return NextResponse.json({ error: 'drip failed' }, { status: 500 })
  }
}
