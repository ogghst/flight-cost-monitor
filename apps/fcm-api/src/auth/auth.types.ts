/*
export interface JwtPayload {
  sub: string // User ID
  email: string
  roles: string[]
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends TokenPair {
  user: AuthUser
}

export interface RefreshTokenPayload {
  sub: string // User ID
  jti: string // Token ID
  type: 'refresh'
  iat?: number
  exp?: number
}
*/

import { AuthUser } from '@fcm/shared/auth'
import { User } from '@fcm/shared/user'

// Helper function to transform User to AuthUser
export function toAuthUser(
  user: User & { roles: { name: string }[] }
): AuthUser {
  const roles = user.roles.map((role) => role.name)
  return {
    ...user,
    roles,
  }
}
