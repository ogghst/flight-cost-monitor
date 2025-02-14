import { baseEntitySchema } from '@fcm/shared/types'
import { z } from 'zod'
import { userSchema } from './user/base.js'

export const refreshTokenSchema = baseEntitySchema.extend({
  token: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  revoked: z.boolean().default(false),
  replacedByToken: z.string().optional().nullable(),
  generationNumber: z.number(),
  family: z.string(),
  user: userSchema.optional().nullable(),
})

// Type for DB refresh token
export type RefreshToken = z.infer<typeof refreshTokenSchema>
