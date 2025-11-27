import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if user has authentication cookies
    const accessToken = request.cookies.get('access')
    console.log("ACCESS", accessToken);

    const isAuthenticated = !!accessToken
    console.log("is auth", isAuthenticated);


    // Define protected routes (routes that require authentication)
    const protectedRoutes = ['/listing', '/bookings', '/profile']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Define auth routes (login, register) that authenticated users shouldn't access
    const authRoutes = ['/login', '/register']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Redirect unauthenticated users trying to access protected routes to login
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users trying to access auth routes to home
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

// Configure which routes to run proxy on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
