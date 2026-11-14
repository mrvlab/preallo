'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  className?: string
}

export function RollingDigits({ value, className }: Props) {
  const [playing, setPlaying] = useState(false)
  const prefersReduced = usePrefersReducedMotion()
  const chars = value.split('')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReduced) {
      setPlaying(true)
      return
    }
    setPlaying(false)
    timer.current = window.setTimeout(() => setPlaying(true), 20)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [value, prefersReduced])

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', whiteSpace: 'pre' }}
    >
      {chars.map((c, i) => (
        <Digit
          key={`${i}-${c}`}
          char={c}
          delay={prefersReduced ? 0 : i * 28}
          animate={playing}
        />
      ))}
    </span>
  )
}

function Digit({
  char,
  delay,
  animate,
}: {
  char: string
  delay: number
  animate: boolean
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
          transition: `transform 900ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
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
