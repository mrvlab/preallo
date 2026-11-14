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
): Classified {
  const lower = description.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k.toLowerCase()))) {
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
      confidence: 0.6,
      needsReview: true,
    }
  }
  return {
    confidence: 0.2,
    needsReview: true,
  }
}
