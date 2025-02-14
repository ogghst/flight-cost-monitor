import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_CONSTANTS, type AuthSession } from '@fcm/shared/auth'
import { ConsoleLogger } from '@fcm/shared/logging'

const logger = new ConsoleLogger('Middleware')

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/flight-search-advanced'
]

// Define public routes that should be accessible without auth
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/flight-search'
]

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  logger.debug('Processing request', {
    pathname,
    isProtected: isProtectedRoute(pathname),
    isPublic: isPublicRoute(pathname)
  })

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get current auth state
  const hasSession = !!request.cookies.get(AUTH_CONSTANTS.COOKIE_NAMES.SESSION)
  const hasRefreshToken = !!request.cookies.get(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN)

  // Attempt to get access token from auth header
  const authHeader = request.headers.get('authorization')
  const hasAccessToken = !!authHeader && authHeader.startsWith('Bearer ')

  logger.debug('Auth session state', {
    hasSession,
    hasAccessToken,
    hasRefreshToken
  })

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!hasSession || (!hasAccessToken && !hasRefreshToken)) {
      logger.debug('Unauthorized access to protected route')
      
      // Store the attempted URL to redirect back after login
      const callbackUrl = encodeURIComponent(request.url)
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
      )
    }
  }

  // Handle public routes (prevent authenticated users from accessing login/register)
  if (isPublicRoute(pathname) && hasSession && hasAccessToken) {
    logger.debug('Authenticated user accessing public route')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Clone headers to modify
  const requestHeaders = new Headers(request.headers)
  
  // Add correlation ID for request tracing
  requestHeaders.set('x-correlation-id', crypto.randomUUID())

  // If we have a session token, add it to all API requests
  if (authHeader) {
    requestHeaders.set('Authorization', authHeader)
  }

  // Continue with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set secure headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. Static files (/_next/static, /favicon.ico, etc.)
     * 2. API routes (/api/*)
     * 3. Public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}
