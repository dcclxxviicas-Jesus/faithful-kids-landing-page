'use client'

/* The checkout page.
 *
 * Replaced the previous "Choose your plan" layout on Aug 31 2026. What that
 * page claimed and what is actually true had drifted badly: a lesson count
 * inflated by ninety (310 is real), a 4.9/5 rating from twelve thousand
 * parents (8 active non-test
 * subscriptions), "Screen time controls" (no such feature exists anywhere in
 * the app), and a countdown to a "limited time offer" that never expired.
 * None of that survives here.
 *
 * The design is the segmented-toggle treatment: one card, one decision, and
 * the yearly plan favoured by having more to say rather than by the monthly
 * option being greyed out.
 *
 * Prices come from ../checkout-variants/kit and treatments; the amounts
 * actually charged live in app/api/checkout/route.ts and must match.
 */
import { ToggleTreatment } from '../checkout-variants/treatments'

export default function Checkout() {
  return <ToggleTreatment year={97} monthly={12.99} tag="checkout" />
}
