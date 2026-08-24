import { NextRequest, NextResponse } from 'next/server'
import { adminPassword } from '@/lib/admin-stats'
import { runTrialEmails, previewTrialEmails } from '@/lib/trial-runner'

export const maxDuration = 120

// Manual entry point for the trial sequence. The scheduled run happens inside
// /api/leads/drip (Hobby plan caps us at two cron jobs).
//   ?dry=1     -> report what WOULD send, send nothing
//   ?preview=1 -> render the due emails as HTML
export async function GET(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get('password') || ''
  const expected = await adminPassword()
  if (!expected || pw !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (req.nextUrl.searchParams.get('preview') === '1') {
      return new NextResponse(
        `<body style="font-family:system-ui;padding:24px">${await previewTrialEmails()}</body>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
    const dry = req.nextUrl.searchParams.get('dry') === '1'
    const out = await runTrialEmails(dry)
    return NextResponse.json({ ok: true, dry, ...out })
  } catch (err) {
    console.error('trial-emails error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'failed' },
      { status: 500 }
    )
  }
}
