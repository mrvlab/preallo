'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { MonthGoalsCard } from '@/components/settings/month-goals-card'
import { DefaultSplitCard } from '@/components/settings/default-split-card'
import { SalaryCard } from '@/components/settings/salary-card'
import { AccountCard } from '@/components/settings/account-card'
import { ResetCard } from '@/components/settings/reset-card'
import { SectionCard } from '@/components/settings/section-card'

function currentMonthKey() {
  const d = new Date()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${d.getUTCFullYear()}-${m}`
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function SettingsPage() {
  const key = currentMonthKey()
  const me = useQuery(api.users.me)
  const summary = useQuery(api.months.summary, { key })

  if (me === undefined || summary === undefined) {
    return (
      <div className="mx-auto w-full max-w-2xl p-5 md:p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--p-06)]" />
      </div>
    )
  }

  if (!me || !summary) {
    return (
      <div className="mx-auto w-full max-w-2xl p-5 md:p-8">
        <p className="text-sm text-[var(--muted-foreground)]">
          Setting up your account.
        </p>
      </div>
    )
  }

  const monthLabel = MONTH_NAMES[Number(key.split('-')[1]) - 1]

  return (
    <div className="mx-auto w-full max-w-2xl p-5 md:p-8">
      <h1 className="mb-6 text-[22px] font-semibold tracking-[-0.01em] text-[var(--text)]">
        Settings
      </h1>
      <div className="flex flex-col gap-4">
        <MonthGoalsCard
          monthKey={key}
          monthLabel={monthLabel}
          initialGoals={summary.goals}
        />
        <DefaultSplitCard initial={me.defaultSplit} />
        <SalaryCard
          initialSalary={me.defaultSalary}
          monthKey={key}
          monthIncome={summary.income}
        />
        <SectionCard title="Currency">
          <p className="text-sm text-[var(--text)]">SEK</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            More currencies land with the import flow.
          </p>
        </SectionCard>
        <AccountCard />
        <SectionCard title="FAQ">
          <Link
            href="/faq"
            className="text-sm text-[var(--brand-primary)] hover:underline"
          >
            Read the FAQ
          </Link>
        </SectionCard>
        <ResetCard monthKey={key} />
      </div>
    </div>
  )
}
