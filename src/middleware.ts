// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ROLE_HOME, normaliseRole } from '@/helper/roleHome';

/**
 * Role-scoped sections of the app. Every prefix here requires a valid session;
 * `roles` lists the normalised categories allowed in that section.
 *
 * The extra roles beyond the obvious one are not slack — they are existing
 * navigation paths in the app. Admin pages link into /tutor/* (course details,
 * class quality, single-student feedback) and /teamlead/*; the RM dashboard
 * links to /tutor for impersonation; academy slot allocation links into
 * /salesHead. Removing them would break those flows.
 */
const ROLE_SECTIONS: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/academy', roles: ['academic', 'admin'] },
  { prefix: '/teamlead', roles: ['teamlead', 'admin'] },
  { prefix: '/relationshipmanager', roles: ['relationshipmanager', 'admin'] },
  { prefix: '/salesHead', roles: ['saleshead', 'academic', 'admin'] },
  { prefix: '/tutor', roles: ['tutor', 'admin', 'teamlead', 'relationshipmanager'] },
  { prefix: '/student', roles: ['student', 'admin', 'tutor', 'teamlead', 'relationshipmanager'] },
];

/**
 * API endpoints that must not be reachable anonymously. `roles: null` means any
 * signed-in user; a list means that category only.
 *
 * /Api/admin/talent and /Api/admin/classQuality live under the admin prefix but
 * are genuinely called from student and tutor pages, so they are
 * authentication-only — restricting them to admins would break those screens.
 */
const PROTECTED_APIS: { prefix: string; roles: string[] | null }[] = [
  { prefix: '/Api/admin/tutors', roles: ['admin', 'teamlead'] },
  { prefix: '/Api/admin/userInfo', roles: ['admin', 'teamlead'] },
  { prefix: '/Api/admin/classQuality', roles: null },
  { prefix: '/Api/admin/talent', roles: null },
];

// `ROLE_HOME` (where to send a signed-in user who lands on a section they may
// not view) and `normaliseRole` come from @/helper/roleHome, shared with the
// post-login router and the landing header.

/** Rewrites the outgoing cookie header so downstream routes see the impersonated user. */
function withImpersonatedCookie(request: NextRequest, impersonateToken: string) {
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

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const impersonateToken = request.cookies.get('impersonate_token')?.value;
  const { pathname } = request.nextUrl;
  const referer = request.headers.get("referer") || "";
  console.log(`[Middleware] Path: ${pathname} | Referer: ${referer}`);

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

  // The mobile app authenticates with a Bearer header rather than a cookie.
  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  let activeToken = token || bearerToken || undefined;
  if (isTutorContext && impersonateToken) {
    activeToken = impersonateToken;
  }

  // Redirect /T&Cs to landing page FAQ section (same tab)
  if (pathname === '/T&Cs' || pathname === '/T%26Cs') {
    return NextResponse.redirect(new URL('/#faq', request.url));
  }

  const apiRule = PROTECTED_APIS.find(r => pathname.startsWith(r.prefix));

  // Define public routes that should skip middleware
  const publicRoutes = ['/login', '/signup', '/register', '/', '/about'];

  // Skip middleware for public routes.
  // Use exact match for '/' to prevent it from matching all paths via startsWith.
  // Guarded APIs are checked first so a public prefix can never shadow them.
  if (!apiRule && publicRoutes.some(route =>
    route === '/' ? pathname === '/' : (pathname === route || pathname.startsWith(route + '/') || pathname === route)
  )) {
    return NextResponse.next();
  }

  const section = ROLE_SECTIONS.find(s => pathname.startsWith(s.prefix));
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);

  // ── Guarded API endpoints: answer with JSON, never a redirect ──────────────
  if (apiRule) {
    if (!activeToken) {
      console.log(`[Middleware] Unauthenticated API call to ${pathname}`);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    try {
      const { payload } = await jwtVerify(activeToken, secret);
      const role = normaliseRole((payload as any).category);
      if (apiRule.roles && !apiRule.roles.includes(role)) {
        console.log(`[Middleware] Role '${role}' forbidden on ${pathname}`);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (isTutorContext && impersonateToken) {
        return withImpersonatedCookie(request, impersonateToken);
      }
      return NextResponse.next();
    } catch (error: any) {
      console.log('[Middleware] API token invalid/expired:', error.message);
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
  }

  // ── Role-scoped pages ─────────────────────────────────────────────────────
  if (section) {
    if (!activeToken) {
      console.log(`[Middleware] No token for ${pathname}, redirecting to login`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token (checks signature AND expiration)
      const { payload } = await jwtVerify(activeToken, secret);
      const role = normaliseRole((payload as any).category);

      if (!section.roles.includes(role)) {
        // Signed in, wrong section. Send them to their own dashboard rather than
        // /login — they have a valid session, so a login bounce would loop.
        const home = ROLE_HOME[role];
        console.log(`[Middleware] Role '${role}' not allowed on ${section.prefix}, redirecting to ${home || '/login'}`);
        if (!home || pathname.startsWith(home)) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.redirect(new URL(home, request.url));
      }

      console.log(`[Middleware] Token valid for role '${role}', allowing access`);

      // Token is valid, allow access.
      // If we used an impersonateToken, we transparently swap it for the 'token'
      // so that all backend routes (even those not using getDataFromToken)
      // see the impersonated user.
      if (isTutorContext && impersonateToken) {
        return withImpersonatedCookie(request, impersonateToken);
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

  // Not a protected route, but still check if we need to swap cookies for APIs.
  if (isTutorContext && impersonateToken) {
    return withImpersonatedCookie(request, impersonateToken);
  }

  // Not a protected route, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
