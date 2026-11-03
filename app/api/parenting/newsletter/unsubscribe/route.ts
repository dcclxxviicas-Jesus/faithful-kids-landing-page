import { verifyNewsletterToken, setSubscriberStatus } from '@/lib/parenting-db'

export const dynamic = 'force-dynamic'

// One-click unsubscribe for Faithful Kids Weekly. GET for the link in the
// footer, POST for the List-Unsubscribe-Post header. Never leaks whether the
// address exists.
async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const email = (url.searchParams.get('email') || '').toLowerCase().trim()
  const token = url.searchParams.get('token') || ''
  if (!email || !verifyNewsletterToken(email, 'unsubscribe', token)) {
    return new Response('Invalid unsubscribe link.', { status: 400 })
  }
  try { await setSubscriberStatus(email, 'unsubscribed') } catch { /* same page either way */ }
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Unsubscribed</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7f7;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="background:#fff;border-radius:16px;padding:40px;max-width:420px;text-align:center;">
<h1 style="font-size:1.3rem;color:#16314f;">You&rsquo;re unsubscribed</h1>
<p style="color:#555;line-height:1.6;">No more Faithful Kids Weekly. The articles stay free at <a href="https://faithfulkids.app/parenting" style="color:#16a34a;font-weight:700;">faithfulkids.app/parenting</a> whenever you want them.</p>
</div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  )
}

export async function GET(req: Request) { return handle(req) }
export async function POST(req: Request) { return handle(req) }
