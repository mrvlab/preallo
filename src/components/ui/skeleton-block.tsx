import { cn } from '@/lib/utils'

type Shade = 'line' | 'soft' | 'mid' | 'strong'

const SHADES: Record<Shade, string> = {
  line: 'bg-[var(--p-04)]',
  soft: 'bg-[var(--p-06)]',
  mid: 'bg-[var(--p-10)]',
  strong: 'bg-[var(--p-16)]',
}

// Pulses only when motion is allowed; reduced-motion users get a static placeholder.
export function Bone({
  className,
  shade = 'mid',
  round,
}: {
  className?: string
  shade?: Shade
  round?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block motion-safe:animate-pulse',
        SHADES[shade],
        round ? 'rounded-full' : 'rounded-[var(--radius-1)]',
        className,
      )}
    />
  )
}

// A bone that takes its height from real typography: pass the same text classes as the
// content it stands in for, and the line box matches it exactly. Width is in em of that text.
export function TextBone({
  className,
  w,
  shade = 'mid',
}: {
  className?: string
  w: string
  shade?: Shade
}) {
  return (
    <span aria-hidden="true" className={cn('block', className)}>
      <span
        className={cn(
          // Top-aligned and nudged with relative positioning so the bone never grows the line box.
          'relative top-[calc((1lh-1em)/2)] inline-block h-[1em] max-w-full rounded-[var(--radius-1)] align-top text-transparent select-none motion-safe:animate-pulse',
          SHADES[shade],
        )}
        style={{ width: w }}
      >
        &#8203;
      </span>
    </span>
  )
}
