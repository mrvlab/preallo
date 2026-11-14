'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { ChevronRight } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'
import { DefaultSplitCard } from '@/components/settings/default-split-card'
import { AccountCard } from '@/components/settings/account-card'
import { ResetCard } from '@/components/settings/reset-card'
import { SectionCard } from '@/components/settings/section-card'
import { useMonth } from '@/components/month-context'
import { useModals } from '@/components/modals/modals-provider'
import { Bone } from '@/components/ui/skeleton-block'
import { krw } from '@/lib/format'
import { monthName } from '@/lib/months'

export default function SettingsPage() {
  const { monthKey: key } = useMonth()
  const { openGoals, openIncome } = useModals()
  const me = useQuery(api.users.me)
  const summary = useQuery(api.months.summary, { key })
  const loading = me === undefined || summary === undefined

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-8 lg:px-7 lg:pt-7">
      <h1 className="mb-6 text-[1.75rem] leading-9 font-bold tracking-[-0.01em] text-[var(--text)]">Settings</h1>
      {loading ? (
        <SettingsSkeleton />
      ) : !me || !summary ? (
        <p className="text-sm text-[var(--muted-foreground)]">Setting up your account.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <ButtonCard
            onClick={openGoals}
            title={`${monthName(key)} goals`}
            value={`${summary.goals.needs} / ${summary.goals.wants} / ${summary.goals.savings}`}
            sub="Needs, wants and savings for this month only."
          />
          <DefaultSplitCard initial={me.defaultSplit} />
          <ButtonCard
            onClick={openIncome}
            title="Salary"
            value={krw(summary.income)}
            sub={me.defaultSalary ? `Default for new months: ${krw(me.defaultSalary)}` : 'No default salary yet.'}
          />
          <SectionCard title="Currency">
            <p className="text-sm text-[var(--text)]">SEK</p>
          </SectionCard>
          <AccountCard />
          <SectionCard title="FAQ">
            <Link href="/faq" className="text-sm text-[var(--brand-primary)] hover:underline">
              Read the FAQ
            </Link>
          </SectionCard>
          <SectionCard title="Import history">
            <Link href="/import" className="text-sm text-[var(--brand-primary)] hover:underline">
              Import old budget sheets
            </Link>
          </SectionCard>
          <ResetCard monthKey={key} />
        </div>
      )}
    </div>
  )
}

function ButtonCard({
  title,
  value,
  sub,
  onClick,
}: {
  title: string
  value: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-[var(--radius-4)] bg-card p-5 text-left shadow-[inset_0_0_0_1px_var(--line)] transition-shadow duration-[120ms] hover:shadow-[inset_0_0_0_1px_var(--p-16)]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[var(--text)]">{title}</span>
        <span className="mt-1 block text-2xl font-bold tracking-[-0.02em] text-[var(--text)] tabular-nums">{value}</span>
        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{sub}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)]" />
    </button>
  )
}

function SettingsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading settings" className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-2 rounded-[var(--radius-4)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
          <Bone className="h-3.5 w-28" shade="mid" />
          <Bone className="h-7 w-36" shade="strong" />
          <Bone className="h-3 w-52" shade="soft" />
        </div>
      ))}
      {[0, 1, 2].map((i) => (
        <div key={`s${i}`} className="flex flex-col gap-3 rounded-[var(--radius-4)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
          <Bone className="h-3.5 w-24" shade="mid" />
          <Bone className="h-3 w-40" shade="soft" />
        </div>
      ))}
    </div>
  )
}
