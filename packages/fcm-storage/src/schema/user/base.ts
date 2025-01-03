import { AuthType, OAuthProvider } from '@fcm/shared/auth'
import { z } from 'zod'
import { baseEntitySchema } from '../base-entity.js'
import type { BaseRefreshToken } from '../types.js'

// Base user schema for database records
export const userSchema = baseEntitySchema.extend({
  // Authentication
  email: z.string().email(),
  username: z.string().optional(),
  password: z.string().optional().nullable(),

  // Profile
  firstName: z.string().min(1).optional().nullable(),
  lastName: z.string().min(1).optional().nullable(),
  image: z.string().url().optional().nullable(),
  active: z.boolean().default(true),

  // OAuth
  authType: z.nativeEnum(AuthType).optional().default(AuthType.CREDENTIAL),
  oauthProvider: z.nativeEnum(OAuthProvider).optional().nullable(),
  oauthProviderId: z.string().optional().nullable(),
  oauthProfile: z.string().optional().nullable(), // JSON string for SQLite

  // Security
  lastLogin: z.date().optional().nullable(),
  passwordResetToken: z.string().optional().nullable(),
  passwordResetExpires: z.date().optional().nullable(),
  refreshTokens: z.array(z.custom<BaseRefreshToken>()).default([]).nullable(),
})

// Type for basic user data
export const userDataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
})

// TypeScript types
export type User = z.infer<typeof userSchema>
export type UserData = z.infer<typeof userDataSchema>
