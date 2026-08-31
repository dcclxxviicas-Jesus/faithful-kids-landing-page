'use client'
import { ToggleTreatment } from '../treatments'

/* The confirmed pair. $97 is the only annual price that has ever collected
   money here; $12.99 monthly holds the yearly saving at 38%. */
export default function P() {
  return <ToggleTreatment year={97} monthly={12.99} tag="toggle" />
}
