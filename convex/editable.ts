import type { QueryCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'

export const DEFAULT_PAYDAY = 25

const keyOf = (y: number, m: number) => {
  const d = new Date(Date.UTC(y, m, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// A month's budget runs from its payday to the day before the next one, so before payday
// today still belongs to last month's budget. Same rule as budgetMonthKey in src/lib/months.ts.
export function budgetKeyUTC(payday: number, now = new Date(Date.now())) {
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  return keyOf(y, now.getUTCDate() >= payday ? m : m - 1)
}

// Last month, this month and every month ahead can change; older months are locked.
export function lastEditableKey(payday: number, now = new Date(Date.now())) {
  const [y, m] = budgetKeyUTC(payday, now).split('-').map(Number)
  return keyOf(y, m - 2)
}

export async function paydayOf(ctx: QueryCtx, userId: Id<'users'>) {
  return (await ctx.db.get(userId))?.payday ?? DEFAULT_PAYDAY
}

// Uses UTC, which runs up to two hours behind Sweden, so around midnight on payday
// the server allows slightly more than the app does and never refuses what the app offers.
export async function assertEditable(ctx: QueryCtx, userId: Id<'users'>, monthKey: string) {
  const lastKey = lastEditableKey(await paydayOf(ctx, userId))
  if (monthKey < lastKey) throw new Error(`${monthKey} is locked. Only last month and later can change.`)
}
