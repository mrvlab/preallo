export function krNoDecimals(n: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(n)
}

export function krw(n: number) {
  return `${krNoDecimals(n)} kr`
}

export function daysLeftInMonth(now = new Date()) {
  const last = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    0,
  ).getUTCDate()
  return Math.max(0, last - now.getUTCDate())
}

export function weeksLeft(now = new Date()) {
  return Math.max(1, Math.ceil(daysLeftInMonth(now) / 7))
}
