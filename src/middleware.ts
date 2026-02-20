// =============================================================================
// checkmAIte - Route Protection Middleware
// =============================================================================
// Protects authenticated routes and redirects unauthenticated users to login
// =============================================================================

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/modes', '/play', '/analysis', '/account'];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/login', '/register'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Check if the path is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => path === route);

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to home
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/modes', nextUrl.origin));
  }

  return NextResponse.next();
});

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    '/((?!_next|api|public|stockfish|favicon.ico|.*\\.).*)',
  ],
};
