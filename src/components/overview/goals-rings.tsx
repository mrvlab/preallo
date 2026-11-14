'use client'

import { useEffect, useState } from 'react'

type Goals = { needs: number; wants: number; savings: number }
type Totals = { needs: number; wants: number; savings: number }

const BUCKETS: Array<keyof Goals> = ['needs', 'wants', 'savings']

type Props = {
  size?: number
  pct: Totals
  goals: Goals
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

export function GoalsRings({ size = 170, pct, goals }: Props) {
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (reduced) {
      setPlaying(true)
      return
    }
    setPlaying(false)
    const t = window.setTimeout(() => setPlaying(true), 20)
    return () => window.clearTimeout(t)
  }, [reduced, pct.needs, pct.wants, pct.savings])
  const CX = size / 2
  const SW = size * 0.085
  const GAP = size * 0.02
  const radii: Record<keyof Goals, number> = {
    needs: CX - SW / 2 - 2,
    wants: CX - SW * 1.5 - GAP - 2,
    savings: CX - SW * 2.5 - GAP * 2 - 2,
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
          const used = goals[k] > 0 ? pct[k] / goals[k] : 0
          const fill =
            k === 'savings' ? Math.min(1, used) : Math.max(0, 1 - used)
          const lap = k === 'savings' ? 0 : Math.max(0, Math.min(1, used - 1))
          const main = fill * Cc
          const lapLen = lap * Cc
          return (
            <g key={k} transform={`rotate(-90 ${CX} ${CX})`}>
              <circle
                cx={CX}
                cy={CX}
                r={R}
                fill="none"
                stroke="var(--p-10)"
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
                  strokeDasharray={`${playing ? main : 0} ${Cc}`}
                  style={{
                    transition: reduced
                      ? 'none'
                      : 'stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1)',
                  }}
                />
              )}
              {lapLen > 0.5 && (
                <circle
                  cx={CX}
                  cy={CX}
                  r={R}
                  fill="none"
                  stroke={`var(--${k}-ink)`}
                  strokeWidth={SW}
                  strokeLinecap="round"
                  strokeDasharray={`${playing ? lapLen : 0} ${Cc}`}
                  style={{
                    transition: reduced
                      ? 'none'
                      : 'stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1) 200ms',
                  }}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
