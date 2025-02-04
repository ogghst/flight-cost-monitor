import { z } from 'zod'
import { baseEntitySchema } from '../types/base-entity.js'
import { AuthType, OAuthProvider } from '../types/index.js'

// Base user schema for database records
export const userSchema = baseEntitySchema.extend({
  // Id
  id: z.string().describe('user id'),

  // Authentication
  email: z.string().email().describe('user email'),
  username: z.string().optional().describe('user username'),
  password: z.string().optional().nullable().describe('user password'),

  // Profile
  firstName: z
    .string()
    .min(1)
    .optional()
    .nullable()
    .describe('user first name'),
  lastName: z.string().min(1).optional().nullable().describe('user last name'),
  avatar: z.string().url().optional().nullable().describe('user avatar'),
  active: z.boolean().default(true).describe('user active'),

  // OAuth
  authType: z
    .nativeEnum(AuthType)
    .optional()
    .default(AuthType.CREDENTIAL)
    .describe('user auth type'),
  oauthProvider: z
    .nativeEnum(OAuthProvider)
    .optional()
    .nullable()
    .describe('user oauth provider'),
  oauthProviderId: z
    .string()
    .optional()
    .nullable()
    .describe('user oauth provider id'),
  oauthProfile: z.string().optional().nullable().describe('user oauth profile'), // JSON string for SQLite

  // Security
  lastLogin: z.date().optional().nullable(),
  passwordResetToken: z
    .string()
    .optional()
    .nullable()
    .describe('password reset token'),
  passwordResetExpires: z
    .date()
    .optional()
    .nullable()
    .describe('password reset expires'),
  refreshTokenExpiresAt: z
    .date()
    .optional()
    .nullable()
    .describe('refresh token expires at'),
  //refreshTokens: z.array(z.custom<BaseRefreshToken>()).default([]).nullable(),
  //roles: z.array(z.custom<Role>()).default([]).nullable(),
})

/*
// Type for basic user data
export const userDataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
})
*/

export const userWithRelationsSchema = userSchema.extend({
  roles: z.array(z.object({ name: z.string() })).describe('user roles'),
})

// TypeScript types
export type User = z.infer<typeof userSchema>
//export type UserData = z.infer<typeof userDataSchema>
export type UserWithRelations = z.infer<typeof userWithRelationsSchema>
