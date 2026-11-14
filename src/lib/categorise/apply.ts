import { RULES } from './rules'

export type Classified = {
  bucket?: 'needs' | 'wants' | 'savings'
  savingsSlug?: string
  category?: string
  confidence: number
  needsReview: boolean
}

export function classify(
  description: string,
  bucketHint?: 'needs' | 'wants' | 'savings',
  bucketSure = false,
): Classified {
  const lower = description.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      if (bucketSure && bucketHint && bucketHint !== rule.bucket) {
        return { bucket: bucketHint, category: rule.category, confidence: 0.9, needsReview: false }
      }
      return {
        bucket: rule.bucket,
        savingsSlug: rule.savingsSlug,
        category: rule.category,
        confidence: 0.95,
        needsReview: false,
      }
    }
  }
  // No rule matched. Use bucket hint from parser if present, otherwise flag.
  if (bucketHint) {
    return {
      bucket: bucketHint,
      confidence: bucketSure ? 0.9 : 0.6,
      needsReview: !bucketSure,
    }
  }
  return {
    confidence: 0.2,
    needsReview: true,
  }
}
