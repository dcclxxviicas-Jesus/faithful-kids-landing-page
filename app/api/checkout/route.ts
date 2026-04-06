import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// Plan configs - prices in cents, billed monthly
const PLANS: Record<string, { name: string; amount: number; interval: 'month' | 'year'; intervalCount: number }> = {
  monthly: { name: 'Faithful Kids Monthly', amount: 3999, interval: 'month', intervalCount: 1 },
  quarterly: { name: 'Faithful Kids 4-Month', amount: 7996, interval: 'month', intervalCount: 4 },
  annual: { name: 'Faithful Kids Annual', amount: 11988, interval: 'year', intervalCount: 1 },
}

export async function POST(req: NextRequest) {
  const { plan } = await req.json()
  const planConfig = PLANS[plan]

  if (!planConfig) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const origin = req.headers.get('origin') || 'http://localhost:3456'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: planConfig.name,
            description: 'Bible story videos for kids ages 5+. Zero ads. Doctrinally reviewed.',
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
    subscription_data: {
      trial_period_days: 7,
    },
    success_url: `https://app.faithfulkids.app/activate?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  })

  return NextResponse.json({ url: session.url })
}
