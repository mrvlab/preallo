'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type Props = {
  itemId: Id<'items'> | null
  onClose: () => void
}

export function ItemSheet({ itemId, onClose }: Props) {
  const items = useQuery(
    api.items.listForMonth,
    itemId ? { monthKey: currentMonthKey() } : 'skip',
  )
  const item = items?.find((i) => i._id === itemId) ?? null

  const update = useMutation(api.items.update)
  const remove = useMutation(api.items.remove)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [due, setDue] = useState<string>('')
  const [category, setCategory] = useState('')
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (item) {
      setName(item.name)
      setAmount(item.amount != null ? String(item.amount) : '')
      setDue(item.due != null ? String(item.due) : '')
      setCategory(item.category ?? '')
      setLocked(item.locked)
    }
  }, [item?._id])

  async function save() {
    if (!item) return
    await update({
      id: item._id,
      patch: {
        name,
        amount: amount ? Number(amount) : undefined,
        due: due ? Number(due) : undefined,
        category: category || undefined,
        locked,
      },
    })
    onClose()
  }

  async function del() {
    if (!item) return
    await remove({ id: item._id })
    onClose()
  }

  return (
    <Sheet open={!!itemId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-5 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit item</SheetTitle>
        </SheetHeader>
        {item && (
          <form
            className="flex flex-1 flex-col gap-4 px-4"
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Amount">
              <Input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <Field label="Due day">
              <Input
                type="number"
                min={1}
                max={31}
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </Field>
            <Field label="Category">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Groceries"
              />
            </Field>
            <label className="flex items-center justify-between rounded-[var(--radius-3)] bg-[var(--p-04)] px-3 py-2">
              <span className="text-sm">Locked amount</span>
              <Switch checked={locked} onCheckedChange={setLocked} />
            </label>
            <div className="mt-auto flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={del}
                className="flex h-10 items-center gap-2 rounded-[var(--radius-3)] px-3 text-sm text-[var(--warn)] hover:bg-[var(--wants-soft)]"
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                type="submit"
                className="ml-auto h-10 rounded-[var(--radius-3)] bg-[var(--brand-primary)] px-4 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      {children}
    </label>
  )
}

function currentMonthKey() {
  const d = new Date()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${d.getUTCFullYear()}-${m}`
}
