import crypto from 'crypto'

const PIXEL_ID = '1491397289442041'
const API_VERSION = 'v21.0'

/**
 * Hash a value for Meta (lowercase + trimmed + SHA256 hex)
 */
function hashSha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

interface CapiEvent {
  event_name: 'PageView' | 'Lead' | 'InitiateCheckout' | 'StartTrial' | 'CompleteRegistration' | 'Purchase'
  event_id: string // for deduplication with browser pixel
  event_source_url?: string
  action_source?: 'website' | 'email' | 'app' | 'chat' | 'phone_call' | 'physical_store' | 'system_generated' | 'other'
  user_data: {
    email?: string
    external_id?: string
    client_ip_address?: string
    client_user_agent?: string
    fbc?: string // Facebook click ID cookie (_fbc)
    fbp?: string // Facebook browser ID cookie (_fbp)
  }
  custom_data?: {
    currency?: string
    value?: number
    content_name?: string
  }
}

/**
 * Send an event to Meta's Conversions API.
 * Fails silently — server-side conversion tracking should never block user flows.
 */
export async function sendCapiEvent(event: CapiEvent): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!token) return

  const userData: Record<string, string | string[]> = {}
  if (event.user_data.email) userData.em = [hashSha256(event.user_data.email)]
  if (event.user_data.external_id) userData.external_id = [hashSha256(event.user_data.external_id)]
  if (event.user_data.client_ip_address) userData.client_ip_address = event.user_data.client_ip_address
  if (event.user_data.client_user_agent) userData.client_user_agent = event.user_data.client_user_agent
  if (event.user_data.fbc) userData.fbc = event.user_data.fbc
  if (event.user_data.fbp) userData.fbp = event.user_data.fbp

  const payload = {
    data: [
      {
        event_name: event.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.event_id,
        event_source_url: event.event_source_url || 'https://faithfulkids.app',
        action_source: event.action_source || 'website',
        user_data: userData,
        ...(event.custom_data ? { custom_data: event.custom_data } : {}),
      },
    ],
    ...(process.env.META_CAPI_TEST_EVENT_CODE ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE } : {}),
  }

  try {
    const resp = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!resp.ok) {
      const errText = await resp.text()
      console.error('Meta CAPI error:', resp.status, errText.slice(0, 200))
    }
  } catch (err) {
    console.error('Meta CAPI request failed:', err instanceof Error ? err.message : 'unknown')
  }
}

/**
 * Extract Meta tracking cookies from a request.
 */
export function getMetaCookies(cookies: Record<string, string | undefined>): { fbc?: string; fbp?: string } {
  return {
    fbc: cookies._fbc,
    fbp: cookies._fbp,
  }
}
