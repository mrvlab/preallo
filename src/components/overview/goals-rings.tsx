'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/components/motion/rolling-digits'

type Goals = { needs: number; wants: number; savings: number }
type Totals = { needs: number; wants: number; savings: number }

const BUCKETS: Array<keyof Goals> = ['needs', 'wants', 'savings']

type Props = {
  size?: number
  pct: Totals
  goals: Goals
}

// Same feel as the old cubic-bezier(.2,.8,.2,1): quick start, long soft landing.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export function GoalsRings({ size = 170, pct, goals }: Props) {
  const reduced = usePrefersReducedMotion()
  // Each ring is one stroke drawn from 0 to its total: the base arc, then, when over goal, on
  // around the circle in the darker shade. One eased progress drives both, so the lap starts
  // exactly where the base fills up, at the same speed, like a single ring going round twice.
  const totals = Object.fromEntries(
    BUCKETS.map((k) => {
      const used = goals[k] > 0 ? pct[k] / goals[k] : 0
      const lap = k === 'savings' ? 0 : Math.max(0, Math.min(1, used - 1))
      // Needs and wants drain as the budget is used. Once over goal the ring is full again in
      // its own colour, and the amount over draws on top of it in a darker shade of that colour.
      const fill = k === 'savings' ? Math.min(1, used) : used > 1 ? 1 : Math.max(0, 1 - used)
      return [k, { fill, lap }]
    }),
  ) as Record<keyof Goals, { fill: number; lap: number }>
  const [t, setT] = useState(0)
  useEffect(() => {
    // Runs on every mount and data change, including when a cached page is shown again.
    let raf = 0
    let start = 0
    // Longer when a ring has to go round further, so the lap is not rushed.
    const duration = 900 + 600 * Math.max(totals.needs.lap, totals.wants.lap)
    const tick = (now: number) => {
      if (!start) start = now
      const x = Math.min(1, (now - start) / duration)
      setT(x)
      if (x < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame((now) => (reduced ? setT(1) : tick(now)))
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, pct.needs, pct.wants, pct.savings, goals.needs, goals.wants, goals.savings])
  const progress = reduced ? 1 : easeOut(t)
  // Proportions from the Figma ring: stroke 11.1% of the size, 3.7% between rings.
  const CX = size / 2
  const SW = size * 0.111
  const GAP = size * 0.037
  const radii: Record<keyof Goals, number> = {
    needs: CX - SW / 2,
    wants: CX - SW * 1.5 - GAP,
    savings: CX - SW * 2.5 - GAP * 2,
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="rings"
      >
        {BUCKETS.map((k) => {
          const R = radii[k]
          const Cc = 2 * Math.PI * R
          const { fill, lap } = totals[k]
          const drawn = progress * (fill + lap)
          const main = Math.min(drawn, fill) * Cc
          const lapLen = Math.max(0, drawn - fill) * Cc
          return (
            <g key={k} transform={`rotate(-90 ${CX} ${CX})`}>
              <circle
                cx={CX}
                cy={CX}
                r={R}
                fill="none"
                stroke={`var(--${k}-soft)`}
                strokeWidth={SW}
              />
              {main > 0.5 && (
                <circle
                  cx={CX}
                  cy={CX}
                  r={R}
                  fill="none"
                  stroke={`var(--${k})`}
                  strokeWidth={SW}
                  strokeLinecap="round"
                  strokeDasharray={`${main} ${Cc}`}
                />
              )}
              {lapLen > 0.5 && (
                <circle
                  cx={CX}
                  cy={CX}
                  r={R}
                  fill="none"
                  stroke={`var(--${k}-over)`}
                  strokeWidth={SW}
                  strokeLinecap="round"
                  strokeDasharray={`${lapLen} ${Cc}`}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
