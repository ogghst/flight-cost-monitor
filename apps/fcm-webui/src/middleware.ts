import { auth } from '@/lib/auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only add auth headers to API calls
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip auth middleware for Next.js Auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Get session token from cookie
  const session = await auth()

  // If there's a session error, redirect to sign in
  if (session?.error === 'RefreshAccessTokenError') {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If we have an access token, use it
  if (session?.accessToken) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${session.accessToken}`)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
