'use client'

type Props = {
  values: number[]
  goal: number
  color: string
}

export function MiniMonths({ values, goal, color }: Props) {
  const max = Math.max(goal * 1.4, ...values, 1)
  const W = 140
  const H = 44
  const bars = 6
  const data = values.slice(-bars)
  while (data.length < bars) data.unshift(0)
  const bw = W / (bars * 1.5)
  const gap = (W - bw * bars) / (bars - 1 || 1)
  const goalY = H - (goal / max) * H

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="shrink-0"
      aria-hidden="true"
    >
      {data.map((v, i) => {
        const h = (v / max) * H
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={H - h}
            width={bw}
            height={Math.max(2, h)}
            rx={2}
            fill={color}
            opacity={v > 0 ? 0.9 : 0.15}
          />
        )
      })}
      <line
        x1={0}
        x2={W}
        y1={goalY}
        y2={goalY}
        stroke="var(--p-16)"
        strokeDasharray="3 3"
        strokeWidth={1}
      />
    </svg>
  )
}
