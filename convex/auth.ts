import { type AuthFunctions, createClient, type GenericCtx } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth'
import type { GenericMutationCtx } from 'convex/server'
import { components, internal } from './_generated/api'
import type { DataModel } from './_generated/dataModel'
import authConfig from './auth.config'

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000'

const authFunctions: AuthFunctions = internal.auth

/** Minimal shape of a Better Auth user document handed to our sync triggers. */
interface AuthUser {
  _id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

type Ctx = GenericMutationCtx<DataModel>

async function findAppUser(ctx: Ctx, authId: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_auth_id', (q) => q.eq('authId', authId))
    .first()
}

/**
 * Better Auth Convex client. Sessions, accounts and the auth user table live
 * inside the Better Auth component; the triggers below mirror each auth user
 * into our app-side `users` table (keyed by `authId`). Implemented inline so
 * the Convex bundle never pulls in any Nuxt/Nitro server code.
 */
export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx: Ctx, user: AuthUser) => {
        const now = Date.now()
        await ctx.db.insert('users', {
          authId: user._id,
          displayName: user.name ?? undefined,
          email: user.email ?? undefined,
          avatarUrl: user.image ?? undefined,
          createdAt: now,
          updatedAt: now,
        })
      },
      onUpdate: async (ctx: Ctx, user: AuthUser, previousUser: AuthUser) => {
        const existing = await findAppUser(ctx, user._id)
        if (!existing) return
        const patch: Record<string, unknown> = {}
        if (user.name !== previousUser.name) patch.displayName = user.name ?? undefined
        if (user.email !== previousUser.email) patch.email = user.email ?? undefined
        if (user.image !== previousUser.image) patch.avatarUrl = user.image ?? undefined
        if (Object.keys(patch).length === 0) return
        patch.updatedAt = Date.now()
        await ctx.db.patch(existing._id, patch)
      },
      onDelete: async (ctx: Ctx, user: AuthUser) => {
        const existing = await findAppUser(ctx, user._id)
        if (existing) await ctx.db.delete(existing._id)
      },
    },
  },
})

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex({ authConfig })],
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    trustedOrigins: [siteUrl],
  })
}

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi()
