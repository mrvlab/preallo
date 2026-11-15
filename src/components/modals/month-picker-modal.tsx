'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { isEditable, monthName } from '@/lib/months'
import { cn } from '@/lib/utils'
import { useMonth } from '@/components/month-context'

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

export function MonthPickerModal({
  open,
  monthKey,
  existing,
  onPick,
  onStart,
  onClose,
}: {
  open: boolean
  monthKey: string
  existing: Set<string>
  onPick: (key: string) => void
  onStart: (key: string) => void
  onClose: () => void
}) {
  const { todayKey } = useMonth()
  const [year, setYear] = useState(Number(monthKey.slice(0, 4)))

  useEffect(() => {
    if (open) setYear(Number(monthKey.slice(0, 4)))
  }, [open, monthKey])

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Choose a month"
      lead="Dotted months have a plan. Pick a dashed one to start it."
    >
      <div className="mt-1.5 mb-3.5 flex items-center justify-center gap-3">
        <IconBtn label="Previous year" onClick={() => setYear((y) => y - 1)}>
          <ChevronLeft size={18} />
        </IconBtn>
        <b className="min-w-[90px] text-center text-2xl tracking-[-0.02em] text-[var(--text)]">
          {year}
        </b>
        <IconBtn label="Next year" onClick={() => setYear((y) => y + 1)}>
          <ChevronRight size={18} />
        </IconBtn>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {SHORT.map((nm, i) => {
          const key = `${year}-${String(i + 1).padStart(2, '0')}`
          const on = key === monthKey
          const has = existing.has(key)
          // An empty month older than last month would be locked as soon as it was made.
          const closed = !has && !isEditable(key, todayKey)
          return (
            <button
              key={key}
              disabled={closed}
              onClick={() => (has ? onPick(key) : onStart(key))}
              aria-label={`${monthName(key)} ${year}, ${has ? 'has a budget' : closed ? 'no budget, closed' : 'new month'}`}
              className={cn(
                'relative rounded-[var(--radius-2)] px-2 py-3.5 text-center text-base font-extrabold transition-[outline-color] duration-[120ms] disabled:pointer-events-none disabled:opacity-35',
                on
                  ? 'bg-[var(--brand-primary)] text-[var(--primary-foreground)]'
                  : has
                    ? 'bg-card text-[var(--text)] shadow-[inset_0_0_0_1px_var(--line)] hover:outline-2 hover:outline-[var(--p-06)]'
                    : 'border-2 border-dashed border-[var(--line)] text-[var(--text)] hover:outline-2 hover:outline-[var(--p-06)]',
              )}
            >
              {nm}
              {!has && !on && (
                <small className="block text-xs font-bold text-[var(--muted-foreground)]">{closed ? 'None' : 'New'}</small>
              )}
              {has && !on && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--savings)]" />
              )}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full text-[var(--text)] transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
    >
      {children}
    </button>
  )
}
