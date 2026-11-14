'use client'

import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Modal, PrimaryButton, QuietButton } from '@/components/ui/modal'
import { useToast } from '@/components/toast'
import { krw } from '@/lib/format'
import { monthName } from '@/lib/months'

type Goals = { needs: number; wants: number; savings: number }

export function MonthGoalsModal({
  open,
  monthKey,
  goals,
  income,
  onClose,
}: {
  open: boolean
  monthKey: string
  goals: Goals
  income: number
  onClose: () => void
}) {
  const update = useMutation(api.months.updateGoals)
  const toast = useToast()
  const [draft, setDraft] = useState<Goals>(goals)

  useEffect(() => {
    if (open) setDraft(goals)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goals.needs, goals.wants, goals.savings])

  // Savings is whatever needs and wants leave, so the split always adds to 100.
  function set(key: 'needs' | 'wants', value: number) {
    const other = key === 'needs' ? draft.wants : draft.needs
    const v = Math.min(value, 100 - other)
    const next = { ...draft, [key]: v }
    next.savings = 100 - next.needs - next.wants
    setDraft(next)
  }

  async function save() {
    await update({ key: monthKey, goals: draft })
    onClose()
    toast(`${monthName(monthKey)} goals saved`)
  }

  const kk = (pct: number) => krw((income * pct) / 100)
  const name = monthName(monthKey)

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={`Goals for ${name}`}
      lead={`Only ${name} changes. Other months keep theirs. Saving more one month is the whole game, so push the savings slider if you can.`}
    >
      <section className="mb-3 rounded-[var(--radius-2)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
        <div className="flex items-center justify-between gap-2">
          <b className="text-[var(--text)]">Your split</b>
          <button
            type="button"
            onClick={() => setDraft({ needs: 50, wants: 30, savings: 20 })}
            className="text-sm font-semibold text-[var(--brand-primary)] underline decoration-[var(--p-16)] underline-offset-[3px] hover:decoration-[var(--brand-primary)]"
          >
            Use 50 / 30 / 20
          </button>
        </div>
        <Row label="Needs" pct={draft.needs} kr={kk(draft.needs)} />
        <input
          type="range"
          min={0}
          max={100}
          value={draft.needs}
          aria-label="Needs goal"
          onChange={(e) => set('needs', Number(e.target.value))}
          className="h-8 w-full accent-[var(--brand-primary)]"
        />
        <Row label="Wants" pct={draft.wants} kr={kk(draft.wants)} />
        <input
          type="range"
          min={0}
          max={100}
          value={draft.wants}
          aria-label="Wants goal"
          onChange={(e) => set('wants', Number(e.target.value))}
          className="h-8 w-full accent-[var(--brand-primary)]"
        />
        <Row label="Savings" pct={draft.savings} kr={kk(draft.savings)} />
      </section>
      <PrimaryButton onClick={save}>Save</PrimaryButton>
      <QuietButton onClick={onClose}>Cancel</QuietButton>
    </Modal>
  )
}

function Row({ label, pct, kr }: { label: string; pct: number; kr: string }) {
  return (
    <div className="mt-1.5 flex justify-between gap-2 font-bold text-[var(--text)]">
      <span>{label}</span>
      <span className="tabular-nums">
        {pct}% <small className="font-semibold text-[var(--muted-foreground)]">{kr}</small>
      </span>
    </div>
  )
}
