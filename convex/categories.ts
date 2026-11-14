import { internalMutation } from './_generated/server'
import { categoryFor } from '../src/lib/categorise/category'

// One-off backfill: gives every imported row and every item one of the app's categories,
// from the same mapping the importer now uses. Salary rows keep their marker. Run with
//   npx convex run categories:backfill
export const backfill = internalMutation({
  args: {},
  handler: async (ctx) => {
    let transactions = 0
    for (const t of await ctx.db.query('transactions').collect()) {
      if (t.category === 'salary') continue
      const category = categoryFor(t.description, t.bucket)
      if (t.category !== category) {
        await ctx.db.patch(t._id, { category })
        transactions++
      }
    }
    let items = 0
    for (const i of await ctx.db.query('items').collect()) {
      const category = categoryFor(i.name, i.bucket)
      if (i.category !== category) {
        await ctx.db.patch(i._id, { category })
        items++
      }
    }
    return { transactions, items }
  },
})
