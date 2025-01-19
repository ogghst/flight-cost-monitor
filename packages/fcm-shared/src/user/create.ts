import { z } from 'zod'
import { userSchema } from './base.js'

// Schema for creating a new user with credentials
export const createCredentialsUserSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    //refreshTokens: true,
    oauthProvider: true,
    oauthProviderId: true,
    oauthProfile: true,
    passwordResetToken: true,
    passwordResetExpires: true,
    lastLogin: true,
  })
  .extend({
    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain uppercase, lowercase, number and special character'
      ),
  })

export const loginCredentialsUserSchema = createCredentialsUserSchema.omit({
  active: true,
  authType: true,
  firstName: true,
  lastName: true,
  avatar: true,
  username: true,
})

// Schema for creating a new OAuth user
export const createOAuthUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  //refreshTokens: true,
  password: true,
  passwordResetToken: true,
  passwordResetExpires: true,
  lastLogin: true,
})

export const loginOAuthUserSchema = createOAuthUserSchema
  .omit({
    active: true,
    authType: true,
    firstName: true,
    lastName: true,
    avatar: true,
    username: true,
  })
  .extend({
    accessToken: z.string(),
  })

// TypeScript types
export type CreateCredentialsUser = z.infer<typeof createCredentialsUserSchema>
export type CreateOAuthUser = z.infer<typeof createOAuthUserSchema>
export type LoginCredentialsUser = z.infer<typeof loginCredentialsUserSchema>
export type LoginOAuthUser = z.infer<typeof loginOAuthUserSchema>
