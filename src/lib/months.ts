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

export function dayLabel(key: string, day: number) {
  const [y, m] = key.split('-').map(Number)
  return `${WEEKDAY_SHORT[new Date(y, m - 1, day).getDay()]} ${day}`
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

export function daysInMonth(key: string) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}
