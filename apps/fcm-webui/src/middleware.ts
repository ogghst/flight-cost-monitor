import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { tokenStorage } from '@/lib/auth/token-storage'

export async function middleware(request: NextRequest) {
  // Only add auth headers to API calls
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Get access token from storage
  const accessToken = request.cookies.get('fcm_access_token')?.value
  const refreshToken = request.cookies.get('fcm_refresh_token')?.value

  // If we have an access token, use it
  if (accessToken) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${accessToken}`)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // If no access token but have refresh token, try to refresh
  if (!accessToken && refreshToken) {
    try {
      const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      })

      if (response.ok) {
        const { accessToken: newAccessToken } = await response.json()
        
        // Store new access token
        tokenStorage.setAccessToken(newAccessToken)

        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('Authorization', `Bearer ${newAccessToken}`)

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}