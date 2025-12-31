import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define paths that are public (no token required)
  const isPublicPath = path === '/login' || path === '/signup' || path === '/verifyemail' || path === '/reset-password' || path === '/'

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || ''

  // 1. Protect private paths: If path is NOT public and user has NO token
  if (!isPublicPath && !token) {
    // Redirect to login, but save the original URL as a 'redirect' param
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Redirect logged-in users away from auth pages (login/signup)
  if (isPublicPath && token && (path === '/login' || path === '/signup')) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect')
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    // Default redirect if no specific destination
    return NextResponse.redirect(new URL('/', request.url))
  }
}

// Configure the paths that trigger this middleware
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/student/:path*', // Protects all student routes including feedback
    '/tutor/:path*',   // Protects tutor routes
    '/admin/:path*',   // Protects admin routes
  ]
}