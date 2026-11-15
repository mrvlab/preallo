'use client'

import { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  children: ReactNode
}

export function SectionCard({ title, description, children }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5">
      <header>
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  )
}
