export const MONTHS_LONG = [
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

export function currentMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthName(key: string) {
  return MONTHS_LONG[Number(key.split('-')[1]) - 1]
}

export function monthYear(key: string) {
  return key.split('-')[0]
}

export function shiftKey(key: string, delta: number) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return currentMonthKey(d)
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 86_400_000

export const DEFAULT_PAYDAY = 25

// A month's budget runs from its payday to the day before the next payday: with payday 25,
// November is 25 Nov to 24 Dec. Same rule as budgetKeyUTC in convex/editable.ts.
export function budgetMonthKey(payday: number, now = new Date()) {
  return currentMonthKey(new Date(now.getFullYear(), now.getMonth() - (now.getDate() >= payday ? 0 : 1), 1))
}

export function periodOf(key: string, payday: number) {
  const [y, m] = key.split('-').map(Number)
  return { start: new Date(y, m - 1, payday), end: new Date(y, m, payday - 1) }
}

const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const daysBetween = (a: Date, b: Date) => Math.round((midnight(b).getTime() - midnight(a).getTime()) / DAY_MS)

export function periodDays(key: string, payday: number) {
  const { start, end } = periodOf(key, payday)
  return daysBetween(start, end) + 1
}

// Days from today until the next payday, today included.
export function daysLeftInPeriod(key: string, payday: number, now = new Date()) {
  return Math.max(0, daysBetween(now, periodOf(key, payday).end) + 1)
}

export function daysUntilStart(key: string, payday: number, now = new Date()) {
  return Math.max(0, daysBetween(now, periodOf(key, payday).start))
}

// yyyy-mm-dd in local time, for date inputs.
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const shortDate = (d: Date) => `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`

export function periodRange(key: string, payday: number) {
  const { start, end } = periodOf(key, payday)
  return `${shortDate(start)} to ${shortDate(end)}`
}

// Items store only a day of the month. Days from payday on fall in the budget's own month,
// earlier days in the next one: rent on the 28th is 28 Nov, Klarna on the 5th is 5 Dec.
export function dueDate(key: string, day: number, payday: number) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, day >= payday ? m - 1 : m, day)
}

export function dayLabel(key: string, day: number, payday: number) {
  return dateLabel(dueDate(key, day, payday))
}

// "Sat 28 Nov"
export function dateLabel(d: Date) {
  return `${WEEKDAY_SHORT[d.getDay()]} ${shortDate(d)}`
}

export const CATEGORIES = [
  'Home',
  'Food',
  'Transport',
  'Subscriptions',
  'Debt',
  'Insurance',
  'Shopping',
  'Fun',
  'Other',
]

export const BUCKET_LABELS = { needs: 'Needs', wants: 'Wants', savings: 'Savings' } as const
export type Bucket = keyof typeof BUCKET_LABELS

// Last month, this month and every month ahead can change. Older months are locked.
export function isEditable(key: string, today: string) {
  return key >= shiftKey(today, -1)
}

