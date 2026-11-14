'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { useQuery } from '@/lib/use-query'
import { Check } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Field,
  Modal,
  ModalClose,
  PrimaryButton,
  QuietButton,
  SelectInput,
  TextInput,
  Toggle,
} from '@/components/ui/modal'
import { useToast } from '@/components/toast'
import { krw } from '@/lib/format'
import { BUCKET_LABELS, monthName, monthYear, type Bucket } from '@/lib/months'
import { cn } from '@/lib/utils'

type Mode = 'all' | 'pick' | 'empty'
const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']

export function NewMonthFlow({
  targetKey,
  monthKeys,
  defaultSalary,
  onDone,
  onClose,
}: {
  targetKey: string | null
  monthKeys: string[]
  defaultSalary?: number
  onDone: (key: string) => void
  onClose: () => void
}) {
  const open = !!targetKey
  const before = monthKeys.filter((k) => targetKey && k < targetKey).sort()
  const fallbackSrc = before.length ? before[before.length - 1] : monthKeys.slice().sort()[0]

  const [step, setStep] = useState(1)
  const [src, setSrc] = useState<string | undefined>(fallbackSrc)
  const [income, setIncome] = useState('')
  const [mode, setMode] = useState<Mode>('all')
  const [keep, setKeep] = useState(true)
  const [picked, setPicked] = useState<Set<string>>(new Set())

  const srcItems = useQuery(api.items.listForMonth, src ? { monthKey: src } : 'skip')
  const srcMonth = useQuery(api.months.get, src ? { key: src } : 'skip')
  const me = useQuery(api.users.me)
  const start = useMutation(api.months.startMonth)
  const toast = useToast()

  useEffect(() => {
    if (!open) return
    setStep(1)
    setSrc(fallbackSrc)
    setMode('all')
    setKeep(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, targetKey])

  useEffect(() => {
    if (!open) return
    const base = defaultSalary || srcMonth?.income || 0
    setIncome(base ? String(base) : '')
  }, [open, defaultSalary, srcMonth?.income])

  useEffect(() => {
    setPicked(new Set((srcItems ?? []).map((i) => i._id)))
  }, [srcItems])

  const all = srcItems ?? []
  const chosen = mode === 'all' ? all : mode === 'pick' ? all.filter((i) => picked.has(i._id)) : []
  const planned = keep ? chosen.reduce((a, i) => a + (i.amount ?? 0), 0) : 0
  const incomeN = Number(income.replace(/\s/g, '').replace(',', '.')) || 0
  const goals = me?.defaultSplit ?? { needs: 50, wants: 30, savings: 20 }
  const name = targetKey ? monthName(targetKey) : ''

  const totals = useMemo(() => {
    const t: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 }
    if (keep) for (const i of chosen) if (i.bucket in t) t[i.bucket as Bucket] += i.amount ?? 0
    return t
  }, [chosen, keep])
  const blanks = chosen.filter((i) => !keep || i.amount == null).length
  const left = incomeN - totals.needs - totals.wants - totals.savings

  async function create() {
    if (!targetKey) return
    await start({
      key: targetKey,
      income: incomeN,
      sourceKey: src,
      itemIds: chosen.map((i) => i._id as Id<'items'>),
      keepAmounts: keep,
    })
    onDone(targetKey)
    toast(`${name} is ready, rings reset`)
  }

  const head = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-extrabold text-[var(--muted-foreground)]">
          Step {step} of 3
        </span>
        <ModalClose />
      </div>
      <div className="mt-1.5 mb-1 h-1.5 overflow-hidden rounded-full bg-[var(--p-10)]">
        <i
          className="block h-full rounded-full bg-[var(--brand-primary)] transition-[width] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </>
  )

  const titles = [`Payday for ${name}`, 'What carries over?', `${name} at a glance`]
  const leads = [
    'Start with what repeats. Change the rest later.',
    src ? `Copying from ${monthName(src)}. Paid ticks start fresh.` : 'Nothing to copy yet.',
    'Check it, then start.',
  ]

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      header={head}
      title={titles[step - 1]}
      lead={leads[step - 1]}
    >
      {step === 1 && (
        <>
          <Field
            label="Salary after tax"
            hint={
              defaultSalary
                ? `Your default from Settings. Change it here for ${name} only.`
                : 'Set a default in Settings and this fills itself.'
            }
          >
            <TextInput
              value={income}
              inputMode="decimal"
              autoComplete="off"
              onChange={(e) => setIncome(e.target.value)}
            />
          </Field>
          {monthKeys.length > 1 && (
            <Field label="Copy from">
              <SelectInput value={src} onChange={(e) => setSrc(e.target.value)}>
                {monthKeys
                  .slice()
                  .sort()
                  .reverse()
                  .map((k) => (
                    <option key={k} value={k}>
                      {monthName(k)} {monthYear(k)}
                    </option>
                  ))}
              </SelectInput>
            </Field>
          )}
          <PrimaryButton onClick={() => setStep(2)}>Next</PrimaryButton>
        </>
      )}

      {step === 2 && (
        <>
          <Choice
            on={mode === 'all'}
            onClick={() => setMode('all')}
            title="Everything"
            tag="Quickest"
            sub={`${all.length} items. Edit anything later.`}
          />
          <Choice
            on={mode === 'pick'}
            onClick={() => setMode('pick')}
            title="Let me choose"
            sub="Untick one-off costs."
          />
          <Choice
            on={mode === 'empty'}
            onClick={() => setMode('empty')}
            title="Start empty"
            sub="Add everything yourself."
          />

          {mode === 'pick' &&
            BUCKETS.map((b) => {
              const its = all.filter((i) => i.bucket === b)
              if (!its.length) return null
              return (
                <section
                  key={b}
                  className="mb-3 rounded-[var(--radius-2)] px-3.5 py-2 shadow-[inset_0_0_0_1px_var(--line)]"
                >
                  <div className="pt-2 pb-0.5 text-[11px] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
                    {BUCKET_LABELS[b]}
                  </div>
                  {its.map((i) => {
                    const on = picked.has(i._id)
                    const toggle = () =>
                      setPicked((s) => {
                        const n = new Set(s)
                        if (n.has(i._id)) n.delete(i._id)
                        else n.add(i._id)
                        return n
                      })
                    return (
                      <div key={i._id} className="flex min-h-12 items-center gap-3 py-1">
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={`Copy ${i.name}`}
                          onClick={toggle}
                          className={cn(
                            'grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-200',
                            on
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white'
                              : 'border-[var(--p-60)] bg-card',
                          )}
                        >
                          {on && <Check size={13} strokeWidth={3} />}
                        </button>
                        <button
                          type="button"
                          onClick={toggle}
                          data-press="none"
                          className="flex-1 text-left text-[15px] font-medium text-[var(--text)]"
                        >
                          {i.name}
                        </button>
                        <span className="font-extrabold tabular-nums">
                          {i.amount == null ? '' : krw(i.amount).replace(' kr', '')}
                        </span>
                      </div>
                    )
                  })}
                </section>
              )
            })}

          {mode !== 'empty' && (
            <section className="mb-3 rounded-[var(--radius-2)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
              <Toggle
                checked={keep}
                onChange={setKeep}
                label={<b className="text-[var(--text)]">Keep the amounts</b>}
                sub="Off for bills that change. Fill them in later."
              />
            </section>
          )}
          <div className="mt-0.5 mb-3 min-h-6 text-[15px] font-bold text-[var(--muted-foreground)]">
            {chosen.length} items
            {keep && chosen.length ? ` · ${krw(planned)} planned` : ''}
          </div>
          <PrimaryButton onClick={() => setStep(3)}>Next</PrimaryButton>
          <QuietButton onClick={() => setStep(1)}>Back</QuietButton>
        </>
      )}

      {step === 3 && (
        <>
          <section className="mb-3 rounded-[var(--radius-2)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
            <div className="text-[11px] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
              Left to spend
            </div>
            <div
              className={cn(
                'text-[34px] leading-tight font-extrabold tracking-[-0.03em] tabular-nums',
                left < 0 ? 'text-[var(--warn)]' : 'text-[var(--text)]',
              )}
            >
              {krw(left)}
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              Salary {krw(incomeN)}
              {blanks
                ? ` · ${blanks} ${blanks === 1 ? 'item needs' : 'items need'} an amount`
                : ''}
            </div>
          </section>
          <section className="mb-3 rounded-[var(--radius-2)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
            {BUCKETS.map((b) => {
              const pct = incomeN > 0 ? (totals[b] / incomeN) * 100 : 0
              const goal = goals[b]
              const over = b !== 'savings' && pct > goal
              const under = b === 'savings' && pct < goal
              return (
                <div key={b} className="mb-3.5 last:mb-0">
                  <div className="flex items-center gap-2.5">
                    <i className="h-[11px] w-[11px] rounded-full" style={{ background: `var(--${b})` }} />
                    <span className="flex-1 font-extrabold">{BUCKET_LABELS[b]}</span>
                    <span className="font-extrabold tabular-nums">{krw(totals[b])}</span>
                  </div>
                  <div className="relative mt-3 mb-2 h-3 rounded-full bg-[var(--p-06)]">
                    <i
                      className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                      style={{ width: `${Math.min(100, pct)}%`, background: `var(--${b})` }}
                    />
                    <b
                      className="absolute -top-1 h-5 w-[3px] -translate-x-px rounded-sm bg-[var(--text)] opacity-75"
                      style={{ left: `${goal}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
                    <span>
                      {Math.round(pct)}% · goal {goal}%
                    </span>
                    <span
                      className={cn(
                        'font-semibold',
                        over ? 'text-[var(--warn)]' : under ? 'text-[var(--amber)]' : 'text-[var(--ok)]',
                      )}
                    >
                      {over ? 'Over target' : under ? 'Below target' : 'On target'}
                    </span>
                  </div>
                </div>
              )
            })}
          </section>
          <PrimaryButton onClick={create}>Start {name}</PrimaryButton>
          <QuietButton onClick={() => setStep(2)}>Back</QuietButton>
        </>
      )}
    </Modal>
  )
}

function Choice({
  on,
  onClick,
  title,
  sub,
  tag,
}: {
  on: boolean
  onClick: () => void
  title: string
  sub: string
  tag?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        'mb-2.5 flex w-full items-start gap-3 rounded-[var(--radius-2)] border-2 bg-card p-3.5 text-left transition-colors duration-[120ms]',
        on ? 'border-[var(--brand-primary)]' : 'border-transparent shadow-[inset_0_0_0_1px_var(--line)]',
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2',
          on ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-[var(--p-60)]',
        )}
      >
        {on && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span>
        <b className="block text-[var(--text)]">
          {title}
          {tag && (
            <span className="ml-1.5 inline-block rounded-[var(--radius-1)] bg-[var(--p-06)] px-1.5 py-px align-middle text-xs font-medium text-[var(--muted-foreground)]">
              {tag}
            </span>
          )}
        </b>
        <small className="text-sm text-[var(--muted-foreground)]">{sub}</small>
      </span>
    </button>
  )
}
