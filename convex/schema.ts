import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    defaultSalary: v.optional(v.number()),
    // Day of the month salary arrives (1 to 28); missing means 25.
    payday: v.optional(v.number()),
    defaultCurrency: v.string(),
    defaultSplit: v.object({
      needs: v.number(),
      wants: v.number(),
      savings: v.number(),
    }),
    savingsBreakdown: v.array(
      v.object({
        slug: v.string(),
        label: v.string(),
        percent: v.number(),
        target: v.optional(v.number()),
      }),
    ),
  }).index('byClerk', ['clerkId']),

  months: defineTable({
    userId: v.id('users'),
    key: v.string(),
    income: v.number(),
    goals: v.object({
      needs: v.number(),
      wants: v.number(),
      savings: v.number(),
    }),
    imported: v.boolean(),
    closedAt: v.optional(v.number()),
  }).index('byUserKey', ['userId', 'key']),

  items: defineTable({
    userId: v.id('users'),
    monthKey: v.string(),
    bucket: v.string(),
    savingsSlug: v.optional(v.string()),
    name: v.string(),
    category: v.optional(v.string()),
    amount: v.optional(v.number()),
    due: v.optional(v.number()),
    paid: v.boolean(),
    paidAt: v.optional(v.number()),
    locked: v.boolean(),
    group: v.optional(v.string()),
  })
    .index('byUserMonth', ['userId', 'monthKey'])
    .index('byUserMonthBucket', ['userId', 'monthKey', 'bucket']),

  transactions: defineTable({
    userId: v.id('users'),
    date: v.string(),
    monthKey: v.string(),
    description: v.string(),
    amount: v.number(),
    source: v.object({
      file: v.string(),
      sheet: v.string(),
      row: v.number(),
    }),
    bucket: v.optional(v.string()),
    savingsSlug: v.optional(v.string()),
    category: v.optional(v.string()),
    confidence: v.optional(v.number()),
    needsReview: v.boolean(),
  })
    .index('byUserMonth', ['userId', 'monthKey'])
    .index('byUserReview', ['userId', 'needsReview']),

  // Raw rows from bank and card exports (Nordea, Resurs, Klarna), kept apart from the plan so
  // they never count towards a month's totals. `key` makes a re-import of an overlapping file a
  // no-op. `declined` rows (Klarna "Purchase power too low") were never charged.
  bankTransactions: defineTable({
    userId: v.id('users'),
    bank: v.string(),
    date: v.string(),
    amount: v.number(),
    text: v.string(),
    kind: v.optional(v.string()),
    balance: v.optional(v.number()),
    interest: v.optional(v.number()),
    declined: v.optional(v.boolean()),
    note: v.optional(v.string()),
    currency: v.string(),
    key: v.string(),
  })
    .index('byUserDate', ['userId', 'date'])
    .index('byUserKey', ['userId', 'key']),
})
