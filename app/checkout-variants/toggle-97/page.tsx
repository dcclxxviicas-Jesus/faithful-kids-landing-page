'use client'
import { ToggleTreatment } from '../treatments'

/* The only annual price that has ever collected money here: $97, plus a $12.99
   monthly that keeps the yearly saving near 40%. */
export default function P() {
  return <ToggleTreatment year={97} monthly={12.99} tag="toggle-97" />
}
