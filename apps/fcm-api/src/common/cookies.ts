import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

// We're using a fixed configuration object to ensure consistency
export const cookieConfig = {
  refreshToken: {
    name: 'authjs.refresh-token', // Synced with NextAuth cookie name
    options: {
      path: '/',
      httpOnly: true, // Essential for security - prevents JavaScript access
      sameSite: 'lax' as const, // Allows cookies in common cross-origin scenarios while maintaining security
      secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      domain: process.env.COOKIE_DOMAIN || undefined // Configurable domain for different environments
    },
  },
}

// Enhanced cookie extraction that tries multiple methods to ensure reliability
export const extractRefreshTokenFromCookies = (req: Request): string | null => {
  // First attempt: Try cookie-parser's parsed cookies
  if (req.cookies && req.cookies[cookieConfig.refreshToken.name]) {
    return req.cookies[cookieConfig.refreshToken.name]
  }

  // Second attempt: Manual parsing of cookie header
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) {
    return null
  }

  // Split cookies and find our refresh token
  const cookies = cookieHeader.split('; ')
  const refreshTokenCookie = cookies.find((cookie) =>
    cookie.startsWith(`${cookieConfig.refreshToken.name}=`)
  )

  if (!refreshTokenCookie) {
    return null
  }

  // Extract just the token value
  const [, token] = refreshTokenCookie.split('=')
  return token || null
}
