import { z } from 'zod'
import { userSchema } from '../user/base.js'

/*
export interface TokenPayload {
  sub: string
  email: string
  roles: string[]
}
*/

export interface JwtPayload {
  sub: string // User ID
  jti?: string // Token ID
  family?: string // Token family for rotation
  roles?: string[] // User roles
  type?: 'access' | 'refresh' // Token type
  iat?: number // Issued at
  exp?: number // Expiration
}

/*
export interface AccessTokenPayload {
  sub: string // User ID
  email: string // User email
  roles: string[] // User roles
  iat: number // Issued at
  exp: number // Expiration
  iss: string // Issuer
  aud: string // Audience
  jti: string // Token ID
}
  */

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh'
}

/*
export interface RefreshTokenPayload {
  sub: string // User ID
  jti: string // Token ID
  family: string // Token family for rotation
  iat: number
  exp: number
}
*/

export interface TokenPair {
  accessToken: string
  refreshToken: string // For internal use only
}

/*
export interface AuthUser {
  id: string
  email: string
  username: string
  displayName: string // For UI display purposes
  firstName?: string
  lastName?: string
  roles: string[]
  authType: AuthType
  oauthProvider?: OAuthProvider
  avatar?: string // Consistent naming for profile image
}
*/

export const authUserSchema = userSchema
  .extend({
    roles: z.array(z.string()),
  })
  .omit({
    refreshTokenExpiresAt: true,
    passwordResetExpires: true,
    passwordResetToken: true,
    password: true,
  })
  .describe('Authenticated user data')

export type AuthUser = z.infer<typeof authUserSchema>

export interface AuthUserWithTokens {
  user: AuthUser
  accessToken: string
}

/*
export interface TokenResponse {
  accessToken: string
}

export interface LogoutResponse {
  message: string
}

export interface OAuthUserData {
  provider: OAuthProvider
  providerId: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  image?: string
  profile?: any
}
*/

/*
export interface LoginCredentials {
  username: string // Can be username or email
  password: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  password: string
  confirmPassword: string
}
*/
