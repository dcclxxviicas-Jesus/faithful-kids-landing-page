'use client'
import { ToggleTreatment } from '../treatments'

/* $97 annual but monthly held at $10.99 to stay level with Minno. Cheaper
   monthly, weaker yearly pitch: 26% instead of 38%. */
export default function P() {
  return <ToggleTreatment year={97} monthly={10.99} tag="toggle-97-safe" />
}
