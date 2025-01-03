import { User } from '@fcm/storage'

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

export interface AuthUser {
  id: string
  email: string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  roles: string[]
}

export interface RefreshTokenPayload {
  sub: string // User ID
  jti: string // Token ID
  type: 'refresh'
  iat?: number
  exp?: number
}

// Helper function to transform User to AuthUser
export function toAuthUser(
  user: User & { roles: { name: string }[] }
): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles.map((role) => role.name),
  }
}
