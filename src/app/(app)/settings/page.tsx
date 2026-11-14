'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { SignOutButton, useUser } from '@clerk/nextjs'
import { ChevronRight, LogOut } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'
import { useMonth } from '@/components/month-context'
import { useModals } from '@/components/modals/modals-provider'
import { useToast } from '@/components/toast'
import { RollingDigits } from '@/components/motion/rolling-digits'
import { Bone } from '@/components/ui/skeleton-block'
import { inputClass } from '@/components/ui/modal'
import { krNoDecimals } from '@/lib/format'
import { monthName } from '@/lib/months'
import { cn } from '@/lib/utils'

type Split = { needs: number; wants: number; savings: number }

const card = 'rounded-[var(--radius-4)] bg-card px-6 py-[1.375rem] shadow-[inset_0_0_0_1px_var(--line)]'
const kr2 = (n: number) =>
  `${new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} kr`

export default function SettingsPage() {
  const { monthKey: key, editable } = useMonth()
  const { openGoals, openDefaultSalary } = useModals()
  const me = useQuery(api.users.me)
  const summary = useQuery(api.months.summary, { key })
  const months = useQuery(api.months.listForUser)
  const loading = me === undefined || summary === undefined
  const imported = (months ?? []).filter((m) => m.imported).length
  const name = monthName(key)

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-8 lg:px-7 lg:pt-0">
      <header className="flex h-[4.875rem] items-center lg:pt-1">
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.01em] text-[var(--text)] lg:text-[2.1rem]">
          Settings
        </h1>
      </header>
      {loading ? (
        <SettingsSkeleton />
      ) : !me || !summary ? (
        <p className="text-sm text-[var(--muted-foreground)]">Setting up your account.</p>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[672fr_486fr]">
          <div className="flex flex-col gap-5">
            <SettingCard
              onClick={openGoals}
              disabled={!editable}
              label={`${name} goals`}
              big={splitText(summary.goals)}
              sub={editable ? `Needs, wants, savings. Applies to ${name} only.` : `${name} is locked.`}
              right={<SplitBar split={summary.goals} />}
            />
            <DefaultSplitCard initial={me.defaultSplit} salary={me.defaultSalary ?? summary.income} monthName={name} />
            <SettingCard
              onClick={openDefaultSalary}
              label="Default salary"
              big={<RollingDigits value={krNoDecimals(me.defaultSalary ?? 0)} />}
              bigSuffix="kr"
              sub="After tax. Prefilled when you start a month."
            />
            <section className={cn(card, 'grid grid-cols-[1fr_auto] items-center gap-4')}>
              <CardText label="Currency" big="SEK" sub="Swedish krona" />
              <select aria-label="Currency" className={cn(inputClass, 'w-24 text-[var(--muted-foreground)]')} defaultValue="SEK">
                <option value="SEK">SEK</option>
              </select>
            </section>
          </div>

          <div className="flex flex-col gap-5">
            <AccountCard storedName={me.name} />
            <LinkCard href="/faq" title="FAQ" sub="Needs vs wants, how it works, the research" />
            {imported >= 6 && (
              <LinkCard
                href="/settings/default-split"
                title="Suggest a default split from my history"
                sub={`Based on ${imported} imported months.`}
              />
            )}
            <LinkCard href="/import" title="Import old sheets" sub="Excel or CSV, Swedish or English layouts." />
            {editable && <ResetCard monthKey={key} />}
          </div>
        </div>
      )}
    </div>
  )
}

const splitText = (s: Split) => `${s.needs} / ${s.wants} / ${s.savings}`

function CardText({ label, big, bigSuffix, sub }: { label: string; big: ReactNode; bigSuffix?: string; sub: string }) {
  return (
    <span className="block min-w-0">
      <span className="block text-sm font-semibold text-[var(--muted-foreground)]">{label}</span>
      <span className="mt-2.5 flex items-baseline gap-2">
        <b className="text-[1.625rem] leading-none font-extrabold tracking-[-0.02em] whitespace-nowrap text-[var(--text)] tabular-nums sm:text-[1.875rem]">
          {big}
        </b>
        {bigSuffix && <span className="text-[0.9375rem] font-medium text-[var(--muted-foreground)]">{bigSuffix}</span>}
      </span>
      <span className="mt-2 block text-sm text-[var(--muted-foreground)]">{sub}</span>
    </span>
  )
}

function SettingCard({
  label,
  big,
  bigSuffix,
  sub,
  right,
  onClick,
  disabled,
}: {
  label: string
  big: ReactNode
  bigSuffix?: string
  sub: string
  right?: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        card,
        'grid grid-cols-[1fr_auto] items-center gap-4 text-left transition-shadow duration-[120ms] enabled:hover:shadow-[inset_0_0_0_1px_var(--p-16)] disabled:cursor-default',
      )}
    >
      <CardText label={label} big={big} bigSuffix={bigSuffix} sub={sub} />
      <span className="flex items-center gap-3.5">
        {right}
        {!disabled && <ChevronRight className="size-[1.375rem] text-[var(--muted-foreground)]" />}
      </span>
    </button>
  )
}

function SplitBar({ split }: { split: Split }) {
  return (
    <span className="hidden h-2 w-[7.5rem] gap-0.5 overflow-hidden rounded-full sm:flex">
      {(['needs', 'wants', 'savings'] as const).map((b) => (
        <i key={b} style={{ width: `${split[b]}%`, background: `var(--${b})` }} />
      ))}
    </span>
  )
}

function DefaultSplitCard({ initial, salary, monthName: name }: { initial: Split; salary: number; monthName: string }) {
  const update = useMutation(api.users.updateDefaultSplit)
  const [split, setSplit] = useState<Split>(initial)
  const dirty = useRef(false)

  useEffect(() => {
    if (!dirty.current) setSplit(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.needs, initial.wants, initial.savings])

  // Save shortly after the slider settles rather than on every step.
  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(() => {
      update({ split }).then(() => (dirty.current = false))
    }, 400)
    return () => clearTimeout(t)
  }, [split, update])

  function set(next: Split) {
    dirty.current = true
    setSplit(next)
  }

  // Savings is what needs and wants leave, so the split always adds to 100.
  function change(k: 'needs' | 'wants', v: number) {
    const other = k === 'needs' ? split.wants : split.needs
    const value = Math.min(v, 100 - other)
    const next = { ...split, [k]: value }
    next.savings = 100 - next.needs - next.wants
    set(next)
  }

  return (
    <section className={card}>
      <div className="grid items-start gap-x-4 gap-y-2 sm:grid-cols-[1fr_auto]">
        <CardText
          label="Default split"
          big={splitText(split)}
          sub={`For months you start from now on. ${name} keeps its own.`}
        />
        <button
          onClick={() => set({ needs: 50, wants: 30, savings: 20 })}
          className="justify-self-start text-[0.9375rem] font-semibold whitespace-nowrap text-[var(--brand-primary)] underline decoration-[var(--p-16)] underline-offset-[3px] hover:decoration-[var(--brand-primary)] sm:pt-8 sm:text-base"
        >
          Use 50 / 30 / 20
        </button>
      </div>
      <div className="mt-3.5">
        {(['needs', 'wants', 'savings'] as const).map((b) => (
          <div key={b}>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--text)] capitalize">
                <i className="size-2 rounded-full" style={{ background: `var(--${b})` }} />
                {b}
              </span>
              <small className="text-xs font-semibold text-[var(--muted-foreground)] tabular-nums">
                {split[b]}% · {kr2((salary * split[b]) / 100)}
              </small>
            </div>
            {b !== 'savings' && (
              <input
                type="range"
                min={0}
                max={100}
                value={split[b]}
                aria-label={`${b} default`}
                onChange={(e) => change(b, Number(e.target.value))}
                className="h-10 w-full accent-[var(--brand-primary)]"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function AccountCard({ storedName }: { storedName: string }) {
  const { user } = useUser()
  const updateName = useMutation(api.users.updateName)
  const toast = useToast()
  const [name, setName] = useState(storedName || user?.firstName || '')
  const provider = user?.externalAccounts?.[0]?.provider
  const providerLabel = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'email'

  async function save() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === storedName) return
    await updateName({ name: trimmed })
    toast('Name saved')
  }

  return (
    <section className={card}>
      <div className="mb-3.5 flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-lg font-bold text-[var(--primary-foreground)]">
          {(name || '?').charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[var(--muted-foreground)]">Account</span>
          <b className="mt-1.5 block truncate text-[1.375rem] leading-tight font-extrabold tracking-[-0.03em] text-[var(--text)]">
            {name || 'You'}
          </b>
          <span className="mt-1 block text-sm text-[var(--muted-foreground)]">Signed in with {providerLabel}</span>
        </span>
      </div>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-sm font-medium text-[var(--text)]">Name</span>
        <input
          className={inputClass}
          value={name}
          autoComplete="given-name"
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
      </label>
      <SignOutButton>
        <button className="flex w-full items-center gap-2 rounded-[var(--radius-2)] p-3 text-base font-semibold text-[var(--brand-primary)] transition-colors duration-[120ms] hover:bg-[var(--p-04)]">
          <LogOut className="size-[1.125rem]" />
          Sign out
        </button>
      </SignOutButton>
    </section>
  )
}

function LinkCard({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link
      href={href}
      className={cn(card, 'flex items-center justify-between gap-4 transition-shadow duration-[120ms] hover:shadow-[inset_0_0_0_1px_var(--p-16)]')}
    >
      <span>
        <b className="block text-base font-bold text-[var(--text)]">{title}</b>
        <small className="block text-sm text-[var(--muted-foreground)]">{sub}</small>
      </span>
      <ChevronRight className="size-[1.375rem] shrink-0 text-[var(--muted-foreground)]" />
    </Link>
  )
}

function ResetCard({ monthKey }: { monthKey: string }) {
  const reset = useMutation(api.months.resetMonth)
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
  const name = monthName(monthKey)

  return (
    <section className={cn(card, 'text-center')}>
      {confirming ? (
        <>
          <p className="mb-3 text-sm text-[var(--muted-foreground)]">
            Deletes every item planned in {name}. Settings and other months stay.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={async () => {
                await reset({ key: monthKey })
                setConfirming(false)
                toast(`${name} reset`)
              }}
              className="h-10 rounded-[var(--radius-3)] bg-[var(--warn)] px-4 font-semibold text-white"
            >
              Reset {name}
            </button>
            <button onClick={() => setConfirming(false)} className="h-10 rounded-[var(--radius-3)] px-4 text-[var(--muted-foreground)]">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} className="w-full p-1 text-base font-semibold text-[var(--warn)]">
          Reset {name}
        </button>
      )}
    </section>
  )
}

function SettingsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading settings" className="grid items-start gap-5 lg:grid-cols-[672fr_486fr]">
      <div className="flex flex-col gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn(card, 'flex flex-col gap-2.5', i === 1 && 'min-h-[18rem]')}>
            <Bone className="h-3.5 w-28" shade="soft" />
            <Bone className="h-[1.875rem] w-40" shade="strong" />
            <Bone className="h-3 w-60" shade="soft" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-5">
        <div className={cn(card, 'flex flex-col gap-3')}>
          <div className="flex items-center gap-4">
            <Bone className="size-11" shade="strong" round />
            <div className="flex flex-col gap-2">
              <Bone className="h-3 w-16" shade="soft" />
              <Bone className="h-5 w-28" shade="mid" />
            </div>
          </div>
          <Bone className="h-10 w-full" shade="line" />
          <Bone className="h-10 w-24" shade="soft" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn(card, 'flex flex-col gap-2')}>
            <Bone className="h-4 w-20" shade="mid" />
            <Bone className="h-3 w-48" shade="soft" />
          </div>
        ))}
      </div>
    </div>
  )
}
