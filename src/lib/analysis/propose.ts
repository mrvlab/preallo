export type Split = { needs: number; wants: number; savings: number }

export type SavingsBreakdown = Array<{
  slug: string
  label: string
  percent: number
  target?: number
}>

export type ActualStats = {
  needs: { median: number; mean: number; p25: number; p75: number }
  wants: { median: number; mean: number; p25: number; p75: number }
  savings: { median: number; mean: number; p25: number; p75: number }
}

function clip(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function propose(actual: ActualStats, monthlySpend: number) {
  const needs = Math.round(clip(actual.needs.median * 100, 30, 45))
  const savings = Math.round(
    Math.max(actual.savings.median * 100 + 5, 35),
  )
  const wants = Math.max(100 - needs - savings, 15)

  const investment = 60
  const travel = 25
  const emergency = 100 - investment - travel
  const emergencyTarget = monthlySpend * 3

  const split: Split = { needs, wants, savings }
  const savingsBreakdown: SavingsBreakdown = [
    { slug: 'investment', label: 'Investment', percent: investment },
    { slug: 'travel', label: 'Travel fund', percent: travel },
    { slug: 'emergency', label: 'Emergency fund', percent: emergency, target: emergencyTarget },
  ]
  return { split, savingsBreakdown }
}

export function stats(values: number[]) {
  if (values.length === 0) return { median: 0, mean: 0, p25: 0, p75: 0 }
  const sorted = [...values].sort((a, b) => a - b)
  const pick = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length
  return { median: pick(0.5), mean, p25: pick(0.25), p75: pick(0.75) }
}
