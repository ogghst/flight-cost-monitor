import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Map /flight-search-advanced to /flight-offer/advanced
    if (request.nextUrl.pathname === '/flight-search-advanced') {
        const url = request.nextUrl.clone()
        url.pathname = '/flight-offer/advanced'
        return NextResponse.rewrite(url)
    }
}

export const config = {
    matcher: ['/flight-search-advanced'],
}