/*
export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Auth group routes are already protected
  if (pathname.startsWith('/(auth)')) {
    if (!session) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }

  // Public routes
  const isPublicRoute = [
    '/auth/signin',
    '/auth/error',
    '/api/auth',
    '/',
    '/about',
    '/contact',
  ].some((route) => pathname.startsWith(route))

  // API routes
  if (pathname.startsWith('/api/')) {
    // Allow auth API routes
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }
    // Protect other API routes
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Protected pages
  if (!isPublicRoute && !session) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Already logged in, trying to access auth pages
  if (session && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Matcher only for routes that need middleware
export const config = {
  matcher: [
    // Auth routes
    '/auth/:path*',
    // Auth group routes
    '/(auth)/:path*',
    // API routes except auth
    '/api/:path*',
    // Exclude files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
*/
