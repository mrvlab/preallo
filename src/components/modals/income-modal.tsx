'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Field, Modal, PrimaryButton, TextInput, Toggle } from '@/components/ui/modal'
import { useToast } from '@/components/toast'
import { monthName } from '@/lib/months'

export function IncomeModal({
  open,
  monthKey,
  income,
  onClose,
}: {
  open: boolean
  monthKey: string
  income: number
  onClose: () => void
}) {
  const updateIncome = useMutation(api.months.updateIncome)
  const updateDefault = useMutation(api.users.updateDefaultSalary)
  const toast = useToast()
  const [value, setValue] = useState('')
  const [makeDefault, setMakeDefault] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setValue(income ? String(income) : '')
    setMakeDefault(false)
    setTimeout(() => {
      ref.current?.focus()
      ref.current?.select()
    }, 380)
  }, [open, income])

  async function save() {
    const v = Number(value.replace(/\s/g, '').replace(',', '.')) || 0
    await updateIncome({ key: monthKey, income: v })
    if (makeDefault) await updateDefault({ salary: v })
    onClose()
    toast(makeDefault ? 'Salary saved, also your default' : 'Salary saved')
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Salary after tax"
      lead={`Everything in ${monthName(monthKey)} is measured against this.`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <Field label="Amount">
          <TextInput
            ref={ref}
            value={value}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
        <div className="mb-3">
          <Toggle
            checked={makeDefault}
            onChange={setMakeDefault}
            label="Also make this my default"
          />
        </div>
        <PrimaryButton type="submit">Save</PrimaryButton>
      </form>
    </Modal>
  )
}
