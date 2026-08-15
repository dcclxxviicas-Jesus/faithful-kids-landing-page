import { verifyUnsubscribeToken, updateLead } from '@/lib/leads'

// One-click unsubscribe — linked in every lead email and used by the
// List-Unsubscribe header (POST for One-Click, GET for the link).

async function unsubscribe(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const email = (url.searchParams.get('email') || '').toLowerCase().trim()
  const token = url.searchParams.get('token') || ''

  if (!email || !verifyUnsubscribeToken(email, token)) {
    return new Response('Invalid unsubscribe link.', { status: 400 })
  }

  try {
    await updateLead(email, { unsubscribed: true, next_send_at: null })
  } catch {
    // fall through to the same page — do not leak whether the email exists
  }

  return new Response(
    `<!DOCTYPE html><html><head><title>Unsubscribed</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7f7;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="background:#fff;border-radius:16px;padding:40px;max-width:420px;text-align:center;">
<div style="font-size:2rem;">👋</div>
<h1 style="font-size:1.3rem;">You're unsubscribed</h1>
<p style="color:#555;">No more emails from this series. The printable is still yours to keep — and you're always welcome back at <a href="https://faithfulkids.app" style="color:#059669;font-weight:700;">faithfulkids.app</a>.</p>
</div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function GET(req: Request) {
  return unsubscribe(req)
}

export async function POST(req: Request) {
  return unsubscribe(req)
}
