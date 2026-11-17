import { verifyUnsubscribeToken, updateLead, unsubscribeFamilies } from '@/lib/leads'

// Unsubscribe, linked in every lead, trial and customer email.
//
// GET only SHOWS a confirm button. Mail scanners and link previewers fetch
// every link in a message, and when GET did the unsubscribing they silently
// removed people who never asked. POST does the work: that is what the
// button sends, and what the List-Unsubscribe-Post one-click header sends.

function page(title: string, body: string): Response {
  return new Response(
    `<!DOCTYPE html><html><head><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7f7;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="background:#fff;border-radius:16px;padding:40px;max-width:420px;text-align:center;">
<h1 style="font-size:1.3rem;margin:0 0 12px;">${title}</h1>
${body}
</div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

function read(req: Request): { email: string; ok: boolean } {
  const url = new URL(req.url)
  const email = (url.searchParams.get('email') || '').toLowerCase().trim()
  const token = url.searchParams.get('token') || ''
  return { email, ok: !!email && verifyUnsubscribeToken(email, token) }
}

export async function GET(req: Request) {
  const { ok } = read(req)
  if (!ok) return new Response('Invalid unsubscribe link.', { status: 400 })
  return page('Unsubscribe from Faithful Kids emails?', `<p style="color:#555;margin:0 0 20px;">You will stop getting our emails at this address. Receipts and billing notices still arrive if you have a plan.</p>
<form method="POST"><button type="submit" style="background:#16a34a;color:#fff;border:0;border-radius:12px;padding:14px 28px;font-size:1rem;font-weight:700;cursor:pointer;">Yes, unsubscribe me</button></form>`)
}

export async function POST(req: Request) {
  const { email, ok } = read(req)
  if (!ok) return new Response('Invalid unsubscribe link.', { status: 400 })
  // Both sides, independently: a lead, a customer, or both may use this address.
  const results = await Promise.allSettled([
    updateLead(email, { unsubscribed: true, next_send_at: null }),
    unsubscribeFamilies(email),
  ])
  if (results.every((r) => r.status === 'rejected')) {
    console.error('unsubscribe failed for both tables', results)
    return page('Something went wrong', `<p style="color:#555;">We could not unsubscribe you just now. Please reply to any of our emails and we will do it by hand.</p>`)
  }
  return page('You are unsubscribed', `<p style="color:#555;">No more emails from us at this address. Anything you downloaded is still yours to keep, and you are always welcome back at <a href="https://faithfulkids.app" style="color:#16a34a;font-weight:700;">faithfulkids.app</a>.</p>`)
}
