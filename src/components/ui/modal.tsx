'use client'

import { ComponentProps, ReactNode } from 'react'
import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  lead?: string
  children: ReactNode
  header?: ReactNode
}

export function Modal({ open, onOpenChange, title, lead, children, header }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="pa-overlay" />
        <Dialog.Content className="pa-sheet" aria-describedby={undefined}>
          <div className="mx-auto mt-2 h-[5px] w-10 shrink-0 rounded-full bg-[var(--p-16)] md:hidden" />
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
