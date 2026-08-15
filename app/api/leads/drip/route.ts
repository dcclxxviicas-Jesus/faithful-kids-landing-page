import { NextResponse } from 'next/server'
import { getDueLeads, updateLead, sendLeadEmail } from '@/lib/leads'
import { buildEmail, DRIP_SCHEDULE } from '@/lib/lead-emails'

// Drip engine — hit daily by cron-job.org:
//   GET /api/leads/drip?secret=DRIP_SECRET
// Sends each due lead its next email and schedules the one after.

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.DRIP_SECRET) {
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

    return NextResponse.json({ ok: true, due: due.length, sent, failed })
  } catch (e) {
    console.error('drip error:', e)
    return NextResponse.json({ error: 'drip failed' }, { status: 500 })
  }
}
