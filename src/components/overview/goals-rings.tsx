'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/components/motion/rolling-digits'
import { cn } from '@/lib/utils'

type Bucket = 'needs' | 'wants' | 'savings'
type Amounts = Record<Bucket, number>

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']
const LABELS: Record<Bucket, string> = { needs: 'Needs', wants: 'Wants', savings: 'Savings' }

type Props = {
  // Sizes the ring, for example `size-[10.625rem]`. The drawing scales to it.
  className?: string
  // Money planned in each bucket and the goal for it, both in kronor.
  planned: Amounts
  goal: Amounts
  // Keeps this ring at full strength and fades the other two.
  focus?: Bucket
}

const ore = (kr: number) => Math.round(kr * 100)

// Share of a goal that is used, 1 being exactly at it. Counted in whole öre, so a bucket planned
// to the öre of its goal is exactly 1. With no goal set, any money in needs or wants is over, and
// savings has nothing to reach.
export function goalUse(bucket: Bucket, planned: number, goal: number) {
  if (ore(goal) > 0) return ore(planned) / ore(goal)
  return bucket !== 'savings' && ore(planned) > 0 ? Infinity : 0
}

// Whole percent of the goal for display, null with no goal. Rounded, but never onto 100: just
// under reads 99 and just over reads 101, so 100 only ever means the goal is met exactly.
export function goalPercent(bucket: Bucket, planned: number, goal: number) {
  if (ore(goal) <= 0) return null
  const use = goalUse(bucket, planned, goal)
  const percent = Math.round(use * 100)
  return use < 1 ? Math.min(99, percent) : use > 1 ? Math.max(101, percent) : 100
}

// Same feel as the old cubic-bezier(.2,.8,.2,1): quick start, long soft landing.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

// Proportions from the Figma ring: stroke 11.1% of the size, 3.7% between rings.
const SIZE = 170
const CX = SIZE / 2
const SW = SIZE * 0.111
const GAP = SIZE * 0.037
const RADII: Record<Bucket, number> = {
  needs: CX - SW / 2,
  wants: CX - SW * 1.5 - GAP,
  savings: CX - SW * 2.5 - GAP * 2,
}

export function GoalsRings({ className, planned, goal, focus }: Props) {
  const reduced = usePrefersReducedMotion()
  // Each ring is one stroke measured in turns: up to 1 is the ring filling towards its goal, and
  // for needs and wants anything past 1 goes on around the circle in the darker shade, like a
  // single ring going round twice. Savings stops at a full ring.
  const use = (k: Bucket) => goalUse(k, planned[k], goal[k])
  const target: Amounts = {
    needs: Math.max(0, Math.min(2, use('needs'))),
    wants: Math.max(0, Math.min(2, use('wants'))),
    savings: Math.max(0, Math.min(1, use('savings'))),
  }
  const [shown, setShown] = useState<Amounts>({ needs: 0, wants: 0, savings: 0 })
  const shownRef = useRef(shown)
  useEffect(() => {
    // Draws from empty on mount, including when a cached page is shown again. After that a change
    // moves each ring from where it is now, so editing the plan does not replay the whole ring.
    let raf = 0
    let start = 0
    const from = shownRef.current
    const set = (next: Amounts) => {
      shownRef.current = next
      setShown(next)
    }
    const furthest = Math.max(...BUCKETS.map((k) => Math.abs(target[k] - from[k])))
    // Short for a small change, longer when a ring has to go round further, so a lap is not rushed.
    const duration = 400 + 500 * Math.min(1, furthest) + 600 * Math.max(0, furthest - 1)
    const tick = (now: number) => {
      if (!start) start = now
      const x = Math.min(1, (now - start) / duration)
      const e = easeOut(x)
      set({
        needs: from.needs + (target.needs - from.needs) * e,
        wants: from.wants + (target.wants - from.wants) * e,
        savings: from.savings + (target.savings - from.savings) * e,
      })
      if (x < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame((now) => (reduced ? set(target) : tick(now)))
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, target.needs, target.wants, target.savings])
  const drawn = reduced ? target : shown

  const label = BUCKETS.map((k) => {
    const percent = goalPercent(k, planned[k], goal[k])
    return percent === null ? `${LABELS[k]} no goal` : `${LABELS[k]} ${percent}% of goal`
  }).join(', ')

  // A round cap adds half the stroke width at each end, which on the small inner ring is 12% of
  // the way round. The dash is pulled in by that much so the arc, caps included, covers exactly
  // its share and only meets itself at a full turn. Anything under one stroke width shows as a dot.
  const arc = (turns: number, Cc: number) =>
    turns >= 0.9995
      ? {}
      : {
          strokeLinecap: 'round' as const,
          strokeDasharray: `${Math.max(0.01, turns * Cc - SW)} ${Cc}`,
          strokeDashoffset: -SW / 2,
        }

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label} className={cn('rings', className)}>
        {BUCKETS.map((k) => {
          const R = RADII[k]
          const Cc = 2 * Math.PI * R
          const main = Math.min(drawn[k], 1)
          const lap = Math.max(0, drawn[k] - 1)
          // Only the drawn arcs fade. The track stays, or an empty ring out of focus disappears.
          const dim = focus && focus !== k ? 0.35 : 1
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
              {main > 0.001 && (
                <circle
                  cx={CX}
                  cy={CX}
                  r={R}
                  fill="none"
                  stroke={`var(--${k})`}
                  strokeWidth={SW}
                  {...arc(main, Cc)}
                  opacity={dim}
                  className="transition-opacity duration-300"
                />
              )}
              {lap > 0.001 && (
                <circle
                  cx={CX}
                  cy={CX}
                  r={R}
                  fill="none"
                  stroke={`var(--${k}-over)`}
                  strokeWidth={SW}
                  {...arc(lap, Cc)}
                  opacity={dim}
                  className="transition-opacity duration-300"
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
