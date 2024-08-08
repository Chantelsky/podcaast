import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const getUrl = mutation({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args0) => {
    return await ctx.storage.getUrl(args0.storageId)
  },
})
