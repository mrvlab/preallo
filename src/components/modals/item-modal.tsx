'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { useQuery } from '@/lib/use-query'
import { ChevronDown } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Field,
  Modal,
  PrimaryButton,
  QuietButton,
  SelectInput,
  TextInput,
  Toggle,
} from '@/components/ui/modal'
import { useToast } from '@/components/toast'
import { BUCKET_LABELS, CATEGORIES, dayLabel, daysInMonth, type Bucket } from '@/lib/months'
import { cn } from '@/lib/utils'

export type ItemTarget = { id: Id<'items'> } | { bucket: Bucket }

function parseAmount(s: string): number | null {
  const n = Number(s.replace(/\s/g, '').replace(',', '.'))
  return s.trim() && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null
}

export function ItemModal({
  target,
  monthKey,
  onClose,
}: {
  target: ItemTarget | null
  monthKey: string
  onClose: () => void
}) {
  const items = useQuery(api.items.listForMonth, { monthKey })
  const create = useMutation(api.items.create)
  const update = useMutation(api.items.update)
  const remove = useMutation(api.items.remove)
  const toast = useToast()

  const item = target && 'id' in target ? items?.find((i) => i._id === target.id) : undefined
  const bucket = (item?.bucket ?? (target && 'bucket' in target ? target.bucket : 'needs')) as Bucket
  const groups = useMemo(
    () => [...new Set((items ?? []).map((i) => i.group).filter(Boolean))] as string[],
    [items],
  )

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Other')
  const [due, setDue] = useState('')
  const [locked, setLocked] = useState(false)
  const [group, setGroup] = useState('')
  const [advOpen, setAdvOpen] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const open = !!target
  const key = item?._id ?? (target && 'bucket' in target ? `new-${target.bucket}` : null)

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setAmount(item?.amount != null ? String(item.amount) : '')
    setCategory(item?.category && CATEGORIES.includes(item.category) ? item.category : 'Other')
    setDue(item?.due ? `${monthKey}-${String(item.due).padStart(2, '0')}` : '')
    setLocked(item?.locked ?? false)
    setGroup(item?.group ?? '')
    setAdvOpen(false)
    if (!item) setTimeout(() => nameRef.current?.focus(), 380)
    // Reset only when a different item is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, open])

  const dim = daysInMonth(monthKey)
  const dueDay = due ? Number(due.slice(8, 10)) : null
  const advSummary = item
    ? [dueDay ? dayLabel(monthKey, dueDay) : '', locked ? 'fixed' : '', group].filter(Boolean).join(' · ')
    : ''

  async function save() {
    const trimmed = name.trim()
    if (!trimmed) {
      nameRef.current?.focus()
      return
    }
    const amt = parseAmount(amount)
    if (item) {
      await update({
        id: item._id,
        patch: {
          name: trimmed,
          amount: amt,
          category,
          due: dueDay,
          locked,
          group: group.trim() || null,
        },
      })
      toast('Saved')
    } else {
      await create({
        monthKey,
        bucket,
        name: trimmed,
        amount: amt ?? undefined,
        category,
        due: dueDay ?? undefined,
        locked,
        group: group.trim() || undefined,
      })
      toast(`${trimmed} added`)
    }
    onClose()
  }

  async function del() {
    if (!item) return
    const snapshot = item
    await remove({ id: item._id })
    onClose()
    toast(`${snapshot.name} removed`, () => {
      create({
        monthKey: snapshot.monthKey,
        bucket: snapshot.bucket,
        name: snapshot.name,
        amount: snapshot.amount,
        category: snapshot.category,
        due: snapshot.due,
        savingsSlug: snapshot.savingsSlug,
        locked: snapshot.locked,
        group: snapshot.group,
        paid: snapshot.paid,
      })
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={item ? item.name : `Add to ${BUCKET_LABELS[bucket]}`}
      lead={item ? undefined : 'Name it. The amount can wait.'}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <Field label="Name">
          <TextInput
            ref={nameRef}
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            placeholder={bucket === 'savings' ? 'New savings pot' : 'Water bill'}
          />
        </Field>
        <Field label="Amount">
          <TextInput
            value={amount}
            inputMode="decimal"
            autoComplete="off"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Category">
          <SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectInput>
        </Field>

        <button
          type="button"
          aria-expanded={advOpen}
          onClick={() => setAdvOpen((v) => !v)}
          className="mt-0.5 mb-2.5 flex w-full items-center gap-2 border-t border-[var(--line)] px-0.5 py-3 text-left text-[15px] font-bold text-[var(--text)]"
        >
          <ChevronDown
            size={16}
            className={cn(
              'shrink-0 text-[var(--muted-foreground)] transition-transform duration-[180ms]',
              advOpen && 'rotate-180',
            )}
          />
          <span>Advanced</span>
          {!advOpen && (
            <small className="text-[13px] font-normal text-[var(--muted-foreground)]">
              {advSummary || 'Date, group'}
            </small>
          )}
        </button>

        {advOpen && (
          <div>
            <div className="grid grid-cols-2 items-start gap-3">
              <Field label="Payment date">
                <TextInput
                  type="date"
                  value={due}
                  min={`${monthKey}-01`}
                  max={`${monthKey}-${String(dim).padStart(2, '0')}`}
                  onChange={(e) => setDue(e.target.value)}
                />
              </Field>
              <div className="mb-3">
                <span className="mb-1.5 block text-sm leading-5 font-medium text-[var(--text)]">
                  Fixed date
                </span>
                <Toggle checked={locked} onChange={setLocked} label="Locked" boxed />
              </div>
            </div>
            <Field label="Group" hint="A heading of your own in the Plan list.">
              <TextInput
                value={group}
                list={`groups-${monthKey}`}
                autoComplete="off"
                onChange={(e) => setGroup(e.target.value)}
                placeholder="e.g. Home, Car"
              />
              <datalist id={`groups-${monthKey}`}>
                {groups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </Field>
          </div>
        )}

        <PrimaryButton type="submit">{item ? 'Save' : 'Add'}</PrimaryButton>
        {item && (
          <QuietButton type="button" danger onClick={del}>
            Delete
          </QuietButton>
        )}
      </form>
    </Modal>
  )
}
