'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Slider } from '@/components/ui/slider'
import { SectionCard } from '@/components/settings/section-card'
import { propose, type Split } from '@/lib/analysis/propose'
import { krw } from '@/lib/format'

type Breakdown = Array<{
  slug: string
  label: string
  percent: number
  target?: number
}>

export default function DefaultSplitAnalysisPage() {
  const analysis = useQuery(api.analysis.computeActualAverages)
  const me = useQuery(api.users.me)
  const updateSplit = useMutation(api.users.updateDefaultSplit)

  const [split, setSplit] = useState<Split | null>(null)
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)

  const proposed = useMemo(() => {
    if (!analysis?.stats) return null
    return propose(analysis.stats, analysis.monthlySpend)
  }, [analysis])

  if (analysis === undefined || me === undefined) {
    return (
      <div className="mx-auto w-full max-w-2xl p-5 md:p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--p-06)]" />
      </div>
    )
  }

  if (!analysis || analysis.months < 6) {
    return (
      <div className="mx-auto w-full max-w-2xl p-5 md:p-8">
        <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.01em] text-[var(--text)]">
          Default split
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          This flow needs at least six imported months of history. Currently
          imported: {analysis?.months ?? 0}. Head to{' '}
          <a href="/import" className="text-[var(--brand-primary)] underline">
            Import
          </a>{' '}
          and drop your CSVs.
        </p>
      </div>
    )
  }

  const activeSplit = split ?? proposed!.split
  const activeBreakdown = breakdown ?? proposed!.savingsBreakdown

  async function save() {
    await updateSplit({
      split: activeSplit,
      savingsBreakdown: activeBreakdown,
    })
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-5 md:p-8">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.01em] text-[var(--text)]">
        Default split
      </h1>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">
        Based on {analysis.months} imported months. Adjust and save when ready.
      </p>

      <div className="flex flex-col gap-4">
        <SectionCard title="Your history, at a glance">
          {(['needs', 'wants', 'savings'] as const).map((b) => {
            const s = analysis.stats![b]
            return (
              <div
                key={b}
                className="flex items-baseline justify-between border-b border-[var(--line)] py-2 last:border-b-0"
              >
                <div>
                  <div
                    className="text-sm font-medium capitalize"
                    style={{ color: `var(--${b}-ink)` }}
                  >
                    {b}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    mean {Math.round(s.mean * 100)}%, p25–p75{' '}
                    {Math.round(s.p25 * 100)}–{Math.round(s.p75 * 100)}%
                  </div>
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {Math.round(s.median * 100)}%
                </div>
              </div>
            )
          })}
        </SectionCard>

        <SectionCard title="Where your savings actually go">
          {Object.entries(analysis.savingsStats!).map(([slug, s]) => (
            <div
              key={slug}
              className="flex items-baseline justify-between border-b border-[var(--line)] py-2 last:border-b-0"
            >
              <div>
                <div className="text-sm font-medium capitalize text-[var(--text)]">
                  {slug}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  mean {Math.round(s.mean * 100)}%
                </div>
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {Math.round(s.median * 100)}%
              </div>
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="Proposed default"
          description="Nudged toward savings, grounded in your history."
        >
          {(['needs', 'wants', 'savings'] as const).map((k) => (
            <div key={k} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between text-sm">
                <span
                  className="capitalize"
                  style={{ color: `var(--${k}-ink)` }}
                >
                  {k}
                </span>
                <span className="tabular-nums">{activeSplit[k]}%</span>
              </div>
              <Slider
                value={[activeSplit[k]]}
                min={0}
                max={100}
                step={5}
                onValueChange={(v) => {
                  const others = (['needs', 'wants', 'savings'] as const).filter(
                    (x) => x !== k,
                  )
                  const otherSum = activeSplit[others[0]] + activeSplit[others[1]]
                  const target = 100 - v[0]
                  const next: Split = { ...activeSplit, [k]: v[0] }
                  if (otherSum > 0) {
                    others.forEach((o) => {
                      next[o] = Math.round((activeSplit[o] / otherSum) * target)
                    })
                  } else {
                    others.forEach((o) => (next[o] = Math.round(target / 2)))
                  }
                  const sum = next.needs + next.wants + next.savings
                  if (sum !== 100) next[others[0]] += 100 - sum
                  setSplit(next)
                }}
              />
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="Proposed savings breakdown"
          description={`Emergency caps at ${krw(analysis.monthlySpend * 3)}, then rolls into investment.`}
        >
          {activeBreakdown.map((b, i) => (
            <div key={b.slug} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="capitalize">{b.label}</span>
                <span className="tabular-nums">{b.percent}%</span>
              </div>
              <Slider
                value={[b.percent]}
                min={0}
                max={100}
                step={5}
                onValueChange={(v) => {
                  const next = activeBreakdown.map((x, j) =>
                    j === i ? { ...x, percent: v[0] } : x,
                  )
                  const total = next.reduce((a, x) => a + x.percent, 0)
                  if (total !== 100 && next[0]) {
                    const other = next.findIndex((_, j) => j !== i)
                    if (other >= 0) next[other].percent += 100 - total
                  }
                  setBreakdown(next)
                }}
              />
            </div>
          ))}
        </SectionCard>

        <div className="flex items-center gap-2">
          <button
            onClick={save}
            className="h-10 rounded-[var(--radius-3)] bg-[var(--brand-primary)] px-5 text-sm font-medium text-white"
          >
            Save default
          </button>
          <a
            href="/settings"
            className="h-10 rounded-[var(--radius-3)] px-4 text-sm leading-10 text-[var(--muted-foreground)]"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  )
}
