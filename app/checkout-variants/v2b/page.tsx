'use client'

import { Refined } from '../refined'

/* Monthly raised to $10.88 — the ceiling that keeps the live Minno comparison
   post true ("cheaper than Minno's $10.99"). Widens the yearly gap to 40%. */
export default function V2b() {
  return <Refined monthly={10.88} tag="v2b" />
}
