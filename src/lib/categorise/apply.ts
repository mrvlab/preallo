import { RULES, type CategoryRule } from './rules'

type Bucket = 'needs' | 'wants' | 'savings'

export type Classified = {
  bucket?: Bucket
  savingsSlug?: string
  category?: string
  confidence: number
  needsReview: boolean
}

// Bucket per item name, learned from sheets that state it (the tri-column layout).
export type LearnedBuckets = Map<string, Bucket>

// Names differ only in spacing and punctuation across years: "SAAK ( A-kassa )" vs "SAAK (A-kassa)".
export function normalizeName(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9åäö]/g, '')
}

function matches(rule: CategoryRule, lower: string) {
  if (rule.keywords.some((k) => lower.includes(k))) return true
  return (rule.exact ?? []).some((e) => lower.trim() === e)
}

function fromRule(rule: CategoryRule): Classified {
  return {
    bucket: rule.bucket,
    savingsSlug: rule.savingsSlug,
    category: rule.category,
    confidence: 0.95,
    needsReview: false,
  }
}

export function classify(
  description: string,
  bucketHint?: Bucket,
  bucketSure = false,
  learned?: LearnedBuckets,
): Classified {
  const lower = description.toLowerCase()

  const forced = RULES.find((r) => r.force && matches(r, lower))
  if (forced) return fromRule(forced)

  const rule = RULES.find((r) => !r.force && matches(r, lower))
  if (bucketSure && bucketHint) {
    return { bucket: bucketHint, category: rule?.category, confidence: 0.9, needsReview: false }
  }
  if (rule) return fromRule(rule)

  const known = learned?.get(normalizeName(description))
  if (known) return { bucket: known, confidence: 0.85, needsReview: false }

  if (bucketHint) return { bucket: bucketHint, confidence: 0.6, needsReview: true }
  return { confidence: 0.2, needsReview: true }
}

// Majority bucket per name across rows whose sheet states the bucket, after forced rules.
export function learnBuckets(
  rows: Array<{ description: string; bucketHint?: Bucket; bucketSure?: boolean }>,
): LearnedBuckets {
  const counts = new Map<string, Record<Bucket, number>>()
  for (const r of rows) {
    if (!r.bucketSure || !r.bucketHint) continue
    const bucket = classify(r.description, r.bucketHint, true).bucket
    if (!bucket) continue
    const key = normalizeName(r.description)
    const c = counts.get(key) ?? { needs: 0, wants: 0, savings: 0 }
    c[bucket]++
    counts.set(key, c)
  }
  const out: LearnedBuckets = new Map()
  for (const [k, c] of counts) {
    const best = (Object.keys(c) as Bucket[]).sort((a, b) => c[b] - c[a])[0]
    out.set(k, best)
  }
  return out
}
