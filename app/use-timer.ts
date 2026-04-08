'use client'

import { useState, useEffect } from 'react'

const TIMER_KEY = 'fk-offer-expires'
const TIMER_DURATION = 10 * 60 // 10 minutes in seconds

export function useTimer() {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)

  useEffect(() => {
    // Restore or set expiry timestamp
    let expiresAt: number
    try {
      const stored = sessionStorage.getItem(TIMER_KEY)
      if (stored) {
        expiresAt = parseInt(stored, 10)
      } else {
        expiresAt = Date.now() + TIMER_DURATION * 1000
        sessionStorage.setItem(TIMER_KEY, String(expiresAt))
      }
    } catch {
      expiresAt = Date.now() + TIMER_DURATION * 1000
    }

    function tick() {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setTimeLeft(remaining)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return {
    minutes,
    seconds,
    display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    expired: timeLeft <= 0,
  }
}
