import { z } from 'zod'

// JWT related types
export interface JwtPayload {
  sub: string // User email
  roles: string[] // User roles
  jti?: string // JWT ID
  iat?: number // Issued at
  exp?: number // Expiration time
  type?: 'access' | 'refresh' // Token type
}

// Session types
export interface AuthSession {
  user: {
    id: string
    email: string
    roles: string[]
    name?: string
    image?: string
  }
  accessToken: string
  error?: string
}

// API Response types
export interface AuthMeResponse {
  id: string
  email: string
  username?: string
  roles: string[]
  preferences?: Record<string, unknown>
}

// Error types
export enum AuthErrorCode {
  TOKEN_EXPIRED = 'auth/token-expired',
  TOKEN_INVALID = 'auth/token-invalid',
  TOKEN_MISSING = 'auth/token-missing',
  REFRESH_FAILED = 'auth/refresh-failed',
  USER_NOT_FOUND = 'auth/user-not-found',
  INVALID_CREDENTIALS = 'auth/invalid-credentials',
}

export interface AuthErrorResponse {
  code: AuthErrorCode
  message: string
  details?: Record<string, any>
}

// Token management types
export interface TokenRefreshResult {
  accessToken: string
  error?: AuthErrorResponse
}

export interface TokenValidationResult {
  isValid: boolean
  error?: AuthErrorResponse
}

// Zod schemas for runtime validation
export const JwtPayloadSchema = z.object({
  sub: z.string(),
  roles: z.array(z.string()),
  jti: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
  type: z.enum(['access', 'refresh']).optional(),
})

export const AuthSessionSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()),
    name: z.string().optional(),
    image: z.string().optional(),
  }),
  accessToken: z.string(),
  error: z.string().optional(),
})

export const AuthMeResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  roles: z.array(z.string()),
  preferences: z.record(z.unknown()).optional(),
})

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  roles: z.array(z.string()),
  preferences: z.record(z.unknown()).optional(),
})

export interface AuthUser extends z.infer<typeof AuthUserSchema> {}

// Type guards
export function isAuthErrorResponse(
  error: unknown
): error is AuthErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AuthErrorResponse).code === 'string' &&
    typeof (error as AuthErrorResponse).message === 'string'
  )
}
