'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { useQuery } from '@/lib/use-query'
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronLeft } from 'lucide-react'
import { api } from '../../../../../convex/_generated/api'
import { propose, type Split } from '@/lib/analysis/propose'
import { krNoDecimals } from '@/lib/format'
import { BUCKET_LABELS, monthName, monthYear, type Bucket } from '@/lib/months'
import { Bone } from '@/components/ui/skeleton-block'
import { PrimaryButton } from '@/components/ui/modal'
import { useToast } from '@/components/toast'
import { cn } from '@/lib/utils'
import { Segmented } from '@/components/ui/segmented'

type Period = 'recent' | 'all'
type Breakdown = Array<{ slug: string; label: string; percent: number; target?: number }>
type Stats = { median: number; mean: number; p25: number; p75: number; trend: -1 | 0 | 1 }

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']
const card = 'rounded-[var(--radius-4)] bg-card px-6 py-[1.375rem] shadow-[inset_0_0_0_1px_var(--line)]'
const pct = (v: number) => `${Math.round(v * 100)}%`
const splitText = (s: Split) => `${s.needs} / ${s.wants} / ${s.savings}`
const short = (key: string) => `${monthName(key).slice(0, 3)} ${monthYear(key)}`

export default function DefaultSplitPage() {
  const [period, setPeriod] = useState<Period>('recent')
  const analysis = useQuery(api.analysis.computeActualAverages, { period })
  const me = useQuery(api.users.me)
  const save = useMutation(api.users.updateDefaultSplit)
  const toast = useToast()
  const router = useRouter()

  const proposed = useMemo(
    () => (analysis?.stats ? propose(analysis.stats, analysis.monthlySpend) : null),
    [analysis],
  )
  const [split, setSplit] = useState<Split | null>(null)
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)

  // A new period gives a new suggestion; drop any edits made to the old one.
  function changePeriod(next: Period) {
    setPeriod(next)
    setSplit(null)
    setBreakdown(null)
  }

  const loading = analysis === undefined || me === undefined
  const activeSplit = split ?? proposed?.split ?? null
  const activeBreakdown = breakdown ?? proposed?.savingsBreakdown ?? null

  async function onSave() {
    if (!activeSplit || !activeBreakdown) return
    await save({ split: activeSplit, savingsBreakdown: activeBreakdown })
    toast('Default split saved')
    router.push('/settings')
  }

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-32 lg:px-7 lg:pt-0">
      <header className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-5 lg:min-h-[4.875rem] lg:pt-6 lg:pb-7">
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            aria-label="Back to Settings"
            className="grid size-9 place-items-center rounded-full text-[var(--text)] transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.03em] text-[var(--text)] lg:text-[2.1rem]">
              Default split
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {analysis?.from && analysis.to
                ? `From ${analysis.months} finished months, ${short(analysis.from)} to ${short(analysis.to)}.`
                : 'From your finished months.'}
            </p>
          </div>
        </div>
        <Segmented
          label="Period"
          value={period}
          onChange={changePeriod}
          options={[
            { value: 'recent', label: 'Last 12 months' },
            { value: 'all', label: 'All history' },
          ]}
        />
      </header>

      {loading ? (
        <PageSkeleton />
      ) : !analysis || analysis.months < 6 || !activeSplit || !activeBreakdown || !me ? (
        <p className="max-w-xl text-sm text-[var(--muted-foreground)]">
          This needs at least six finished months. You have {analysis?.finishedMonths ?? 0}.{' '}
          <Link href="/import" className="text-[var(--brand-primary)] underline">
            Import old sheets
          </Link>{' '}
          or come back after a few more months.
        </p>
      ) : (
        <>
          <section aria-label="Your history" className="grid gap-5 @min-[42rem]/main:grid-cols-3">
            {BUCKETS.map((b) => (
              <HistoryCard key={b} bucket={b} stats={analysis.stats[b]} series={analysis.series.map((s) => s[b])} keys={analysis.series.map((s) => s.key)} />
            ))}
          </section>

          <div className="mt-5 grid items-start gap-5 @min-[60rem]/main:grid-cols-[672fr_486fr]">
            <ProposalCard
              current={me.defaultSplit}
              split={activeSplit}
              onChange={setSplit}
              overSalary={analysis.overSalary}
              months={analysis.months}
            />
            <SavingsCard
              savingsStats={analysis.savingsStats}
              breakdown={activeBreakdown}
              onChange={setBreakdown}
              monthlySpend={analysis.monthlySpend}
            />
          </div>

          <div className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 lg:sticky lg:inset-x-auto lg:bottom-5 lg:mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-4)] bg-card px-5 py-3.5 shadow-[var(--shadow-6)]">
              <div className="flex items-center gap-2.5 text-sm text-[var(--muted-foreground)]">
                <span>
                  Now <b className="font-bold text-[var(--text)] tabular-nums">{splitText(me.defaultSplit)}</b>
                </span>
                <ArrowRight className="size-4" />
                <span>
                  Suggested <b className="font-bold text-[var(--text)] tabular-nums">{splitText(activeSplit)}</b>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  className="h-10 rounded-[var(--radius-3)] px-4 text-sm leading-10 font-semibold text-[var(--brand-primary)] hover:bg-[var(--p-04)]"
                >
                  Cancel
                </Link>
                <PrimaryButton onClick={onSave} className="w-auto px-5">
                  Save default
                </PrimaryButton>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function HistoryCard({ bucket, stats, series, keys }: { bucket: Bucket; stats: Stats; series: number[]; keys: string[] }) {
  const top = Math.max(...series, 0.01)
  const Trend = stats.trend > 0 ? ArrowUpRight : stats.trend < 0 ? ArrowDownRight : ArrowRight
  return (
    <section className={cn(card, 'flex flex-col')}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: `var(--${bucket}-ink)` }}>
          <i className="size-2 rounded-full" style={{ background: `var(--${bucket})` }} />
          {BUCKET_LABELS[bucket]}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)]">
          <Trend className="size-3.5" />
          {stats.trend > 0 ? 'Rising' : stats.trend < 0 ? 'Falling' : 'Steady'}
        </span>
      </div>
      <div className="mt-2.5 text-[2.125rem] leading-none font-extrabold tracking-[-0.03em] text-[var(--text)] tabular-nums">
        {pct(stats.median)}
      </div>
      <p className="mt-1.5 text-[0.8125rem] text-[var(--muted-foreground)]">
        Median. Usually {pct(stats.p25)}–{pct(stats.p75)}, average {pct(stats.mean)}.
      </p>
      <div className="mt-4 flex h-12 items-end gap-1" aria-label={`${BUCKET_LABELS[bucket]} per month, last ${series.length} months`}>
        {series.map((v, i) => (
          <i
            key={keys[i]}
            title={`${short(keys[i])}: ${pct(v)}`}
            className="block flex-1 rounded-[2px]"
            style={{
              height: `${Math.max(4, (v / top) * 100)}%`,
              background: `var(--${bucket})`,
              opacity: i === series.length - 1 ? 0.95 : 0.4,
            }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[0.6875rem] text-[var(--muted-foreground)]">
        <span>{keys[0] ? short(keys[0]) : ''}</span>
        <span>{keys.at(-1) ? short(keys.at(-1)!) : ''}</span>
      </div>
    </section>
  )
}

function SplitBar({ split, label }: { split: Split; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[4.5rem] shrink-0 text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      <span className="flex h-2.5 flex-1 gap-0.5 overflow-hidden rounded-full">
        {BUCKETS.map((b) => (
          <i
            key={b}
            className="transition-[width] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ width: `${split[b]}%`, background: `var(--${b})` }}
          />
        ))}
      </span>
      <span className="w-[5.5rem] shrink-0 text-right text-xs font-semibold text-[var(--text)] tabular-nums">{splitText(split)}</span>
    </div>
  )
}

function ProposalCard({
  current,
  split,
  onChange,
  overSalary,
  months,
}: {
  current: Split
  split: Split
  onChange: (s: Split) => void
  overSalary: number
  months: number
}) {
  // Savings is what needs and wants leave, so the split always adds to 100.
  function change(k: 'needs' | 'wants', v: number) {
    const other = k === 'needs' ? split.wants : split.needs
    const next = { ...split, [k]: Math.min(v, 100 - other) }
    next.savings = 100 - next.needs - next.wants
    onChange(next)
  }
  return (
    <section className={card}>
      <span className="block text-sm font-semibold text-[var(--muted-foreground)]">Proposed default</span>
      <b className="mt-2.5 block text-[2.125rem] leading-none font-extrabold tracking-[-0.03em] text-[var(--text)] tabular-nums">
        {splitText(split)}
      </b>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Nudged toward savings, grounded in what you actually spent. Adjust before saving.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <SplitBar label="Now" split={current} />
        <SplitBar label="Suggested" split={split} />
      </div>
      <div className="mt-4">
        {BUCKETS.map((b) => (
          <div key={b}>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                <i className="size-2 rounded-full" style={{ background: `var(--${b})` }} />
                {BUCKET_LABELS[b]}
              </span>
              <small className="text-xs font-semibold text-[var(--muted-foreground)] tabular-nums">{split[b]}%</small>
            </div>
            {b !== 'savings' && (
              <input
                type="range"
                min={0}
                max={100}
                value={split[b]}
                aria-label={`${BUCKET_LABELS[b]} suggested`}
                onChange={(e) => change(b, Number(e.target.value))}
                className="h-10 w-full accent-[var(--brand-primary)]"
              />
            )}
          </div>
        ))}
      </div>
      {overSalary > 0 && (
        <p className="mt-3 rounded-[var(--radius-2)] bg-[var(--needs-soft)] px-3 py-2 text-[0.8125rem] text-[var(--needs-ink)]">
          You spent more than your salary in {overSalary} of these {months} months. A split only holds if the
          months stay within the salary.
        </p>
      )}
    </section>
  )
}

function SavingsCard({
  savingsStats,
  breakdown,
  onChange,
  monthlySpend,
}: {
  savingsStats: Record<string, Stats>
  breakdown: Breakdown
  onChange: (b: Breakdown) => void
  monthlySpend: number
}) {
  // Emergency takes what investment and travel leave.
  function change(slug: string, v: number) {
    const inv = breakdown.find((x) => x.slug === 'investment')!.percent
    const trv = breakdown.find((x) => x.slug === 'travel')!.percent
    const nextInv = slug === 'investment' ? Math.min(v, 100 - trv) : inv
    const nextTrv = slug === 'travel' ? Math.min(v, 100 - inv) : trv
    onChange(
      breakdown.map((x) =>
        x.slug === 'investment'
          ? { ...x, percent: nextInv }
          : x.slug === 'travel'
            ? { ...x, percent: nextTrv }
            : { ...x, percent: 100 - nextInv - nextTrv },
      ),
    )
  }
  return (
    <section className={card}>
      <span className="block text-sm font-semibold text-[var(--muted-foreground)]">Proposed savings breakdown</span>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">Share of the savings bucket, and where it went so far.</p>
      <div className="mt-3">
        {breakdown.map((x) => (
          <div key={x.slug}>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[var(--text)]">{x.label}</span>
              <small className="text-xs font-semibold text-[var(--muted-foreground)] tabular-nums">
                {x.percent}% · so far {pct(savingsStats[x.slug]?.mean ?? 0)} of salary
              </small>
            </div>
            {x.slug !== 'emergency' ? (
              <input
                type="range"
                min={0}
                max={100}
                value={x.percent}
                aria-label={`${x.label} share`}
                onChange={(e) => change(x.slug, Number(e.target.value))}
                className="h-10 w-full accent-[var(--brand-primary)]"
              />
            ) : (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Caps at 3x monthly spend ({krNoDecimals(monthlySpend * 3)} kr), then rolls into investment.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading analysis">
      <div className="grid gap-5 @min-[42rem]/main:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn(card, 'flex flex-col gap-2.5')}>
            <Bone className="h-3.5 w-20" shade="mid" />
            <Bone className="h-[2.125rem] w-24" shade="strong" />
            <Bone className="h-3 w-48" shade="soft" />
            <div className="mt-2 flex h-12 items-end gap-1">
              {Array.from({ length: 12 }, (_, j) => (
                <Bone key={j} className={cn('flex-1', ['h-[40%]', 'h-[70%]', 'h-[55%]'][j % 3])} shade="soft" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 @min-[60rem]/main:grid-cols-[672fr_486fr]">
        <div className={cn(card, 'flex min-h-[22rem] flex-col gap-3')}>
          <Bone className="h-3.5 w-32" shade="soft" />
          <Bone className="h-[2.125rem] w-40" shade="strong" />
          <Bone className="h-2.5 w-full" shade="mid" />
          <Bone className="h-2.5 w-full" shade="mid" />
        </div>
        <div className={cn(card, 'flex min-h-[16rem] flex-col gap-3')}>
          <Bone className="h-3.5 w-40" shade="soft" />
          <Bone className="h-3 w-full" shade="line" />
          <Bone className="h-3 w-3/4" shade="line" />
        </div>
      </div>
    </div>
  )
}
