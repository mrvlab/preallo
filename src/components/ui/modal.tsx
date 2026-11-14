'use client'

import { ComponentProps, PointerEvent as ReactPointerEvent, ReactNode, useRef } from 'react'
import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { project, rubberband, spring } from '@/lib/motion/spring'

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  lead?: string
  children: ReactNode
  header?: ReactNode
}

export function Modal({ open, onOpenChange, title, lead, children, header }: ModalProps) {
  const drag = useSheetDrag(() => onOpenChange(false))
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay ref={drag.overlayRef} className="pa-overlay" />
        <Dialog.Content ref={drag.sheetRef} className="pa-sheet" aria-describedby={undefined}>
          {/* Grab zone: on phones the sheet follows the finger down and closes on a flick. */}
          <div
            {...drag.handlers}
            className="relative z-10 -mb-[7px] flex h-5 shrink-0 cursor-grab touch-none items-start justify-center pt-2 active:cursor-grabbing md:hidden"
          >
            <div className="h-[5px] w-10 rounded-full bg-[var(--p-16)]" />
          </div>
          <div className="overflow-y-auto px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+22px)] md:px-6 md:pt-5 md:pb-[22px]">
            {header}
            <Dialog.Title className="mt-1.5 mb-1 text-[20px] leading-7 font-bold tracking-[-0.02em] text-[var(--text)]">
              {title}
            </Dialog.Title>
            {lead && (
              <p className="mb-3.5 text-[15px] text-[var(--muted-foreground)]">{lead}</p>
            )}
            {!lead && <div className="h-2" />}
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function ModalClose({ label = 'Close' }: { label?: string }) {
  return (
    <Dialog.Close
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-[var(--radius-2)] text-[var(--muted-foreground)] transition-colors duration-[120ms] hover:bg-[var(--p-06)] hover:text-[var(--text)]"
    >
      <X size={16} />
    </Dialog.Close>
  )
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('mb-3 block', className)}>
      <span className="mb-1.5 block text-sm leading-5 font-medium text-[var(--text)]">{label}</span>
      {children}
      {hint && (
        <small className="mt-1.5 block text-xs leading-snug text-[var(--muted-foreground)]">
          {hint}
        </small>
      )}
    </label>
  )
}

export const inputClass =
  'h-10 w-full rounded-[var(--radius-2)] bg-card px-3 text-base text-[var(--text)] shadow-[inset_0_0_0_1px_var(--p-16)] outline-none transition-shadow duration-[120ms] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-[var(--brand-primary)]'

export function TextInput(props: ComponentProps<'input'>) {
  return <input {...props} className={cn(inputClass, props.className)} />
}

export function SelectInput(props: ComponentProps<'select'>) {
  return <select {...props} className={cn(inputClass, 'appearance-auto', props.className)} />
}

export function PrimaryButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      className={cn(
        'block h-10 w-full rounded-[var(--radius-2)] bg-[var(--brand-primary)] px-4 text-base font-medium text-[var(--primary-foreground)] transition-[filter] duration-[120ms] hover:brightness-110 active:brightness-90 disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    />
  )
}

export function QuietButton({
  className,
  danger,
  ...props
}: ComponentProps<'button'> & { danger?: boolean }) {
  return (
    <button
      {...props}
      className={cn(
        'block w-full rounded-[var(--radius-2)] p-3 text-center font-semibold transition-colors duration-[120ms] hover:bg-[var(--p-04)]',
        danger ? 'text-[var(--warn)]' : 'text-[var(--brand-primary)]',
        className,
      )}
    />
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  sub,
  boxed,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  sub?: string
  boxed?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between gap-3 text-left',
        boxed
          ? 'h-10 rounded-[var(--radius-2)] px-3 shadow-[inset_0_0_0_1px_var(--p-16)]'
          : 'py-1',
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm text-[var(--muted-foreground)]">{label}</span>
        {sub && <small className="block text-xs text-[var(--muted-foreground)]">{sub}</small>}
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-[var(--brand-primary)]' : 'bg-[var(--p-10)] shadow-[inset_0_0_0_1px_var(--p-10)]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.18),0_0_0_1px_rgba(0,0,0,.04)] transition-transform duration-[250ms] ease-[cubic-bezier(.3,1.4,.5,1)]',
            checked && 'translate-x-4',
          )}
        />
      </span>
    </button>
  )
}

function useSheetDrag(onDismiss: () => void) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const state = useRef<{ startY: number; y: number; history: Array<{ y: number; t: number }> } | null>(null)
  const stop = useRef<(() => void) | null>(null)

  function apply(y: number) {
    const sheet = sheetRef.current
    if (!sheet) return
    sheet.style.transform = y === 0 ? '' : `translateY(${y}px)`
    if (overlayRef.current) {
      overlayRef.current.style.opacity = String(Math.max(0, 1 - y / sheet.offsetHeight))
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const sheet = sheetRef.current
    if (!sheet) return
    e.currentTarget.setPointerCapture(e.pointerId)
    // Grabbing a sheet that is still springing back picks it up where it is.
    stop.current?.()
    const current = new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42 || 0
    sheet.dataset.dragging = 'true'
    state.current = { startY: e.clientY - current, y: current, history: [{ y: current, t: e.timeStamp }] }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const s = state.current
    const sheet = sheetRef.current
    if (!s || !sheet) return
    const raw = e.clientY - s.startY
    s.y = raw < 0 ? rubberband(raw, sheet.offsetHeight) : raw
    s.history.push({ y: s.y, t: e.timeStamp })
    if (s.history.length > 5) s.history.shift()
    apply(s.y)
  }

  function onPointerUp() {
    const s = state.current
    const sheet = sheetRef.current
    state.current = null
    if (!s || !sheet) return
    const first = s.history[0]
    const last = s.history[s.history.length - 1]
    const dt = (last.t - first.t) / 1000
    const velocity = dt > 0 ? (last.y - first.y) / dt : 0
    const height = sheet.offsetHeight
    // Decide from where the flick would land, not from where the finger let go.
    const dismiss = s.y + project(velocity) > height / 2
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (dismiss) {
      if (reduced) return onDismiss()
      stop.current = spring({
        from: s.y,
        to: height,
        velocity,
        damping: 1,
        response: 0.3,
        onUpdate: apply,
        onDone: onDismiss,
      })
    } else {
      stop.current = spring({
        from: s.y,
        to: 0,
        velocity,
        damping: 0.8,
        response: 0.3,
        onUpdate: apply,
        onDone: () => {
          // Back in place: allow the normal close animation again, but never replay the entrance.
          sheet.dataset.dragged = 'true'
          delete sheet.dataset.dragging
        },
      })
    }
  }

  return {
    sheetRef,
    overlayRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  }
}
