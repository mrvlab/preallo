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
