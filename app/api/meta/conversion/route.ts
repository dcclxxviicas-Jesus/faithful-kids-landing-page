import { NextRequest, NextResponse } from 'next/server'
import { sendCapiEvent } from '@/lib/meta-capi'

/**
 * Server-side Meta Conversions API endpoint.
 * Browser sends events here with their event_id, we relay to Meta with
 * full user data (IP, user agent, cookies) for better match quality.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_name, event_id, email, external_id, value, currency, content_name, event_source_url } = body

    if (!event_name || !event_id) {
      return NextResponse.json({ error: 'Missing event_name or event_id' }, { status: 400 })
    }

    // Extract IP and user agent server-side
    const forwardedFor = req.headers.get('x-forwarded-for') || ''
    const clientIp = forwardedFor.split(',')[0].trim() || req.headers.get('x-real-ip') || undefined
    const userAgent = req.headers.get('user-agent') || undefined

    // Extract Meta cookies
    const fbc = req.cookies.get('_fbc')?.value
    const fbp = req.cookies.get('_fbp')?.value

    await sendCapiEvent({
      event_name,
      event_id,
      event_source_url,
      action_source: 'website',
      user_data: {
        email,
        external_id,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbc,
        fbp,
      },
      custom_data: (value || currency || content_name)
        ? { value, currency, content_name }
        : undefined,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Meta conversion API error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
