export function krNoDecimals(n: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(n)
}

export function krw(n: number) {
  return `${krNoDecimals(n)} kr`
}
