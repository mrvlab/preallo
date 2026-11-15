export function krNoDecimals(n: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(n)
}

// Whole kronor stay whole ("8 899 kr"); amounts with öre keep both decimals ("101,85 kr").
export function krw(n: number) {
  const ore = Math.abs(Math.round(n * 100) % 100) !== 0
  const digits = ore ? 2 : 0
  return `${new Intl.NumberFormat('sv-SE', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)} kr`
}
