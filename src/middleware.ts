// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define which routes need authentication
  const protectedRoutes = [
    '/tutor',
    '/student',
  ];

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

  // If it's a protected route, verify token
  if (isProtectedRoute) {
    if (!token) {
      console.log('[Middleware] No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token (checks signature AND expiration)
      jwt.verify(token, process.env.TOKEN_SECRET!);
      console.log('[Middleware] Token valid, allowing access');
      
      // Token is valid, allow access
      return NextResponse.next();
      
    } catch (error: any) {
      console.log('[Middleware] Token invalid/expired:', error.message);
      // Token expired or invalid - clear cookie and redirect
      const response = NextResponse.redirect(
        new URL('/login?expired=true', request.url)
      );
      response.cookies.delete('token');
      return response;
    }
  }

  // Not a protected route, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};