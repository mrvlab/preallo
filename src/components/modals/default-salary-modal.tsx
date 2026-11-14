'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Field, Modal, PrimaryButton, TextInput } from '@/components/ui/modal'
import { useToast } from '@/components/toast'

export function DefaultSalaryModal({
  open,
  salary,
  onClose,
}: {
  open: boolean
  salary: number
  onClose: () => void
}) {
  const update = useMutation(api.users.updateDefaultSalary)
  const toast = useToast()
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setValue(salary ? String(salary) : '')
    setTimeout(() => {
      ref.current?.focus()
      ref.current?.select()
    }, 380)
  }, [open, salary])

  async function save() {
    await update({ salary: Number(value.replace(/\s/g, '').replace(',', '.')) || 0 })
    onClose()
    toast('Default salary saved')
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Default salary"
      lead="After tax. Prefilled when you start a month. Months already started keep theirs."
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
        <PrimaryButton type="submit">Save</PrimaryButton>
      </form>
    </Modal>
  )
}
