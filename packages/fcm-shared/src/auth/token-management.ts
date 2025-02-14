import { jwtDecode } from 'jwt-decode'
import { AUTH_CONSTANTS } from './constants.js'
import { AuthErrorCode, JwtPayload, TokenValidationResult } from './types.js'

export class TokenError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'TokenError'
  }
}

export function validateTokenFormat(token: unknown): TokenValidationResult {
  if (!token || typeof token !== 'string') {
    return {
      isValid: false,
      error: {
        code: AuthErrorCode.TOKEN_INVALID,
        message: 'Invalid token format',
      },
    }
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token)

    if (!decoded || typeof decoded !== 'object') {
      return {
        isValid: false,
        error: {
          code: AuthErrorCode.TOKEN_INVALID,
          message: 'Invalid token payload',
        },
      }
    }

    if (!decoded.exp || typeof decoded.exp !== 'number') {
      return {
        isValid: false,
        error: {
          code: AuthErrorCode.TOKEN_INVALID,
          message: 'Missing or invalid expiration claim',
        },
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: {
        code: AuthErrorCode.TOKEN_INVALID,
        message: 'Token validation failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    }
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    if (!decoded.exp) return true

    // Add threshold to handle clock skew
    const threshold = 5 // seconds
    return decoded.exp * 1000 <= Date.now() + threshold * 1000
  } catch {
    return true
  }
}

export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    if (!decoded.exp) return true

    const expiresAt = decoded.exp * 1000
    return (
      Date.now() >=
      expiresAt - AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH_THRESHOLD
    )
  } catch {
    return true
  }
}

// Cookie management utilities
export function extractRefreshTokenFromCookie(
  cookieString?: string
): string | null {
  if (!cookieString) return null

  const cookies = cookieString.split(';')
  const refreshTokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN}=`)
  )

  if (!refreshTokenCookie) return null

  return refreshTokenCookie.split('=')[1] || null
}
