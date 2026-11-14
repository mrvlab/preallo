'use client'

type Goals = { needs: number; wants: number; savings: number }
type Totals = { needs: number; wants: number; savings: number }

const BUCKETS: Array<keyof Goals> = ['needs', 'wants', 'savings']

type Props = {
  size?: number
  pct: Totals
  goals: Goals
}

export function GoalsRings({ size = 170, pct, goals }: Props) {
  const CX = size / 2
  const SW = size * 0.085
  const GAP = size * 0.02
  const radii: Record<keyof Goals, number> = {
    needs: CX - SW / 2 - 2,
    wants: CX - SW * 1.5 - GAP - 2,
    savings: CX - SW * 2.5 - GAP * 2 - 2,
  }

  const onTarget = BUCKETS.filter((k) => {
    const used = goals[k] > 0 ? pct[k] / goals[k] : 0
    if (k === 'savings') return used >= 0.995
    return used <= 1.005
  }).length

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="rings"
        aria-label={`${onTarget} of 3 on target`}
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
                  strokeDasharray={`${main} ${Cc}`}
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
                  strokeDasharray={`${lapLen} ${Cc}`}
                />
              )}
            </g>
          )
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <b className="text-3xl font-semibold text-[var(--text)] tabular-nums">
          {onTarget}
          <i className="not-italic text-xl text-[var(--muted-foreground)]">
            /3
          </i>
        </b>
        <small className="text-xs text-[var(--muted-foreground)]">on target</small>
      </div>
    </div>
  )
}
