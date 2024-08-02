import { v } from 'convex/values'
import { internalMutation } from './_generated/server'

// internalMutation is used to define a mutation with specific arguments and a handler function that performs the desired option.
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('users', {
      ...args,
    })
  },
})
