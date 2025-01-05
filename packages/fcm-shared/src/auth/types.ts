export enum SearchType {
  SIMPLE = 'SIMPLE',
  ADVANCED = 'ADVANCED',
}

export enum AuthType {
  OAUTH = 'OAUTH',
  CREDENTIAL = 'CREDENTIAL',
}

export const _PROVIDERS = ['GITHUB', 'GOOGLE'] as const
export enum OAuthProvider {
  GITHUB = 'GITHUB',
  GOOGLE = 'GOOGLE',
}

export interface TokenPayload {
  sub: string
  email: string
  authType: AuthType
  roles: string[]
  iat: number
  exp: number
}

export interface RefreshTokenPayload {
  sub: string // User ID
  jti: string // Token ID
  family: string // Token family for rotation
  iat: number
  exp: number
}

export interface AccessTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse extends AccessTokenResponse {
  user: AuthUser
}

export interface AuthUser {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  authType: AuthType
  oauthProvider?: OAuthProvider
  profile?: string
  roles: string[]
  image?: string
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
