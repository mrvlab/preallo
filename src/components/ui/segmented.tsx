'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Option<T extends string> = { value: T; label: ReactNode }

// Segmented control with one white thumb that slides to the chosen segment, like iOS. Segments
// share the width equally so the thumb only ever moves, never resizes. A transition retargets
// from wherever the thumb is, so quick taps redirect it mid-slide instead of queueing.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  segmentClassName,
}: {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label?: string
  className?: string
  segmentClassName?: string
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('relative inline-grid auto-cols-fr grid-flow-col rounded-[7px] bg-[var(--p-06)] p-[3px]', className)}
    >
      <span
        aria-hidden
        className="absolute top-[3px] bottom-[3px] left-[3px] rounded-[var(--radius-2)] bg-card shadow-[0_1px_3px_rgba(0,0,0,.08),0_0_0_1px_var(--p-10)] transition-transform dark:bg-[var(--p-16)] dark:shadow-none duration-300 ease-[cubic-bezier(.25,1,.5,1)] motion-reduce:transition-none"
        style={{
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative z-10 flex h-7 items-center justify-center gap-1.5 rounded-[var(--radius-2)] px-3 text-sm whitespace-nowrap transition-colors duration-[120ms]',
            o.value === value ? 'font-medium text-[var(--text)]' : 'text-[var(--muted-foreground)]',
            segmentClassName,
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
