import { verifyNewsletterToken, setSubscriberStatus, getSubscriber } from '@/lib/parenting-db'

export const dynamic = 'force-dynamic'

function page(title: string, body: string): Response {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7f7;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="background:#fff;border-radius:16px;padding:40px;max-width:440px;text-align:center;box-shadow:0 10px 30px rgba(22,49,79,.08);">
<h1 style="font-size:1.35rem;margin:0 0 10px;color:#16314f;">${title}</h1>
<p style="color:#4b5563;line-height:1.6;margin:0 0 18px;">${body}</p>
<a href="https://faithfulkids.app/parenting" style="color:#16a34a;font-weight:700;text-decoration:none;">Read Parenting at Faithful Kids &rarr;</a>
</div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  )
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const email = (url.searchParams.get('email') || '').toLowerCase().trim()
  const exp = Number(url.searchParams.get('exp') || 0)
  const token = url.searchParams.get('token') || ''
  if (!email || !verifyNewsletterToken(email, 'confirm', token, exp)) {
    return page('This link is not valid', 'It may have expired (links work for 14 days). Enter your email again on any Parenting page and we will send a fresh one.')
  }
  try {
    const row = await getSubscriber(email)
    if (row && row.status !== 'confirmed') await setSubscriberStatus(email, 'confirmed')
  } catch (err) {
    console.error('confirm error', err)
    return page('Something went wrong', 'We could not confirm your subscription just now. Please try the link again in a minute.')
  }
  return page('You are subscribed', 'Faithful Kids Weekly will arrive once a week. Every email has a one-click unsubscribe link, and we never share your address.')
}
