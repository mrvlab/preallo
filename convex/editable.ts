// Last month, this month and every month ahead can change; older months are locked.
// Uses UTC, which runs up to two hours behind Sweden, so around midnight on the 1st
// the server allows slightly more than the app does and never refuses what the app offers.
export function assertEditable(monthKey: string) {
  const now = new Date(Date.now())
  const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const lastKey = `${last.getUTCFullYear()}-${String(last.getUTCMonth() + 1).padStart(2, '0')}`
  if (monthKey < lastKey) throw new Error(`${monthKey} is locked. Only last month and later can change.`)
}
