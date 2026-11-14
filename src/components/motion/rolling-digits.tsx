'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

type Props = {
  value: string
  className?: string
}

export function RollingDigits({ value, className }: Props) {
  // Every new value replays the load animation: snap each column to 0 with no transition,
  // then two frames later roll it up to its digit with the left-to-right stagger.
  const prefersReduced = usePrefersReducedMotion()
  const [played, setPlayed] = useState<string | null>(null)
  const playing = prefersReduced || played === value
  const chars = value.split('')

  useEffect(() => {
    if (prefersReduced) return
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setPlayed(value))
    })
    return () => cancelAnimationFrame(raf)
  }, [value, prefersReduced])

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', whiteSpace: 'pre' }}
    >
      {chars.map((c, i) => (
        <Digit
          key={i}
          char={c}
          delay={prefersReduced ? 0 : i * 28}
          animate={playing}
          smooth={playing && !prefersReduced}
        />
      ))}
    </span>
  )
}

function Digit({
  char,
  delay,
  animate,
  smooth,
}: {
  char: string
  delay: number
  animate: boolean
  smooth: boolean
}) {
  if (!/\d/.test(char)) {
    return <span>{char}</span>
  }
  const n = Number(char)
  const translate = animate ? -n * 10 : 0
  return (
    <span
      style={{
        display: 'inline-block',
        height: '1em',
        lineHeight: 1,
        overflow: 'hidden',
      }}
      aria-label={char}
    >
      <span
        style={{
          display: 'block',
          transform: `translateY(${translate}%)`,
          transition: smooth ? `transform 900ms cubic-bezier(.2,.8,.2,1) ${delay}ms` : 'none',
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{ display: 'block', lineHeight: 1 }}>
            {i}
          </span>
        ))}
      </span>
    </span>
  )
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )
}
