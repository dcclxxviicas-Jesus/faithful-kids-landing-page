import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// Plan configs - prices in cents, billed monthly
const PLANS: Record<string, { name: string; amount: number; interval: 'month' | 'year'; intervalCount: number }> = {
  monthly: { name: 'Faithful Kids Monthly', amount: 1299, interval: 'month', intervalCount: 1 },
  annual: { name: 'Faithful Kids Annual', amount: 9700, interval: 'year', intervalCount: 1 },
}

/* The decline-offer coupon: 20% off the FIRST payment only (duration: once),
   shown one time to people leaving the plan screen without buying (owner's
   call, Oct 5 2026 — the Cal AI pattern). Created lazily so no dashboard
   step is needed; a fixed id makes creation idempotent. */
const DECLINE_COUPON_ID = 'FKPLAN20'
let couponReady = false
async function ensureDeclineCoupon() {
  if (couponReady) return
  try {
    await stripe.coupons.create({
      id: DECLINE_COUPON_ID,
      percent_off: 20,
      duration: 'once',
      name: 'One-time 20% off',
    })
  } catch (e) {
    const code = (e as { code?: string }).code
    if (code !== 'resource_already_exists') throw e
  }
  couponReady = true
}

export async function POST(req: NextRequest) {
  const { plan, distinctId, discount } = await req.json()
  const planConfig = PLANS[plan]

  if (!planConfig) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const useDiscount = discount === true
  if (useDiscount) await ensureDeclineCoupon()

  const origin = req.headers.get('origin') || 'https://faithfulkids.app'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    /* Carries the browser's PostHog distinct_id through Stripe so the purchase
       lands on the same person who browsed. Without it money events arrive as
       stripe:cus_XXX, which never joins the anonymous id used on the site, and
       "which funnel produced this sale" has to be answered by matching
       timestamps by hand. */
    ...(typeof distinctId === 'string' && distinctId ? { client_reference_id: distinctId.slice(0, 200) } : {}),
    payment_method_types: ['card'],
    /* Stripe forbids allow_promotion_codes together with discounts, so the
       decline offer swaps one for the other. */
    ...(useDiscount
      ? { discounts: [{ coupon: DECLINE_COUPON_ID }] }
      : { allow_promotion_codes: true }),
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: planConfig.name,
            description: 'Bible story videos for kids ages 5+. Zero ads.',
          },
          unit_amount: planConfig.amount,
          recurring: {
            interval: planConfig.interval,
            interval_count: planConfig.intervalCount,
          },
        },
        quantity: 1,
      },
    ],
    /* Annual gets a 7-day free trial; monthly has no trial (charged
       immediately). Raised from 3 to 7 on 2026-09-16.

       STRIPE ONLY. The Apple IAP trial is configured in App Store Connect and
       deliberately stays at 3 days, the same way the iOS prices deliberately
       differ from web. Do not "align" them.

       Deliberately NO pre-billing reminder email, owner's call when this
       changed: the enrollment confirmation already carries free-days count,
       exact end date, renewal price and how to cancel, pulled live from the
       subscription. See sendPurchaseConfirmationEmail. */
    ...(plan === 'annual' ? { subscription_data: { trial_period_days: 7 } } : {}),
    success_url: `https://app.faithfulkids.app/activate?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  })

  return NextResponse.json({ url: session.url })
}
