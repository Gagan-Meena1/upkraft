// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const impersonateToken = request.cookies.get('impersonate_token')?.value;
  const { pathname } = request.nextUrl;
  const referer = request.headers.get("referer") || "";
  console.log(`[Middleware] Path: ${pathname} | Referer: ${referer}`);

  // Define which routes need authentication
  const protectedRoutes = [
    '/tutor',
    '/student',
  ];

  let refererPath = "";
  try {
    if (referer) {
      refererPath = new URL(referer).pathname;
    }
  } catch (e) { }

  // Determine which token to prioritize
  // If we are in the tutor section or an API called from the tutor section,
  // we prefer the impersonated token if it exists.
  const isTutorContext = pathname.startsWith('/tutor') ||
    pathname.startsWith('/Api/tutor') ||
    refererPath.startsWith('/tutor');

  let activeToken = token;
  if (isTutorContext && impersonateToken) {
    activeToken = impersonateToken;
  }

  // Redirect /T&Cs to landing page FAQ section (same tab)
  if (pathname === '/T&Cs' || pathname === '/T%26Cs') {
    return NextResponse.redirect(new URL('/#faq', request.url));
  }

  // Define public routes that should skip middleware
  const publicRoutes = ['/login', '/signup', '/register', '/', '/about'];

  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If it's a protected route, verify the active token
  if (isProtectedRoute) {
    if (!activeToken) {
      console.log('[Middleware] No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token (checks signature AND expiration)
      jwt.verify(activeToken, process.env.TOKEN_SECRET!);
      console.log('[Middleware] Token valid, allowing access');

      // Token is valid, allow access. 
      // If we used an impersonateToken, we transparently swap it for the 'token'
      // so that all backend routes (even those not using getDataFromToken) 
      // see the impersonated user.
      if (isTutorContext && impersonateToken) {
        const requestHeaders = new Headers(request.headers);
        const cookieHeader = request.headers.get('cookie') || '';

        // Replace the 'token=...' part with 'token=[impersonateToken]'
        let newCookieHeader = cookieHeader;
        if (cookieHeader.match(/(^|;\s*)token=/)) {
          newCookieHeader = cookieHeader.replace(/(^|;\s*)(token=)([^;]*)/g, `$1$2${impersonateToken}`);
        } else {
          newCookieHeader = cookieHeader
            ? `${cookieHeader.trim().endsWith(';') ? cookieHeader : cookieHeader + ';'} token=${impersonateToken}`
            : `token=${impersonateToken}`;
        }

        requestHeaders.set('cookie', newCookieHeader);
        requestHeaders.set('x-active-token', impersonateToken);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

      return NextResponse.next();

    } catch (error: any) {
      console.log('[Middleware] Token invalid/expired:', error.message);
      // Token expired or invalid - clear cookie and redirect
      const response = NextResponse.redirect(
        new URL('/login?expired=true', request.url)
      );
      response.cookies.delete('token');
      response.cookies.delete('impersonate_token');
      return response;
    }
  }

  // Not a protected route, but still check if we need to swap cookies for APIs
  if (isTutorContext && impersonateToken) {
    const requestHeaders = new Headers(request.headers);
    const cookieHeader = request.headers.get('cookie') || '';

    let newCookieHeader = cookieHeader;
    if (cookieHeader.match(/(^|;\s*)token=/)) {
      newCookieHeader = cookieHeader.replace(/(^|;\s*)(token=)([^;]*)/g, `$1$2${impersonateToken}`);
    } else {
      newCookieHeader = cookieHeader
        ? `${cookieHeader.trim().endsWith(';') ? cookieHeader : cookieHeader + ';'} token=${impersonateToken}`
        : `token=${impersonateToken}`;
    }

    requestHeaders.set('cookie', newCookieHeader);
    requestHeaders.set('x-active-token', impersonateToken);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Not a protected route, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};