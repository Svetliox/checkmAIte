
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedRoutes = ['/modes', '/play', '/analysis', '/account'];

const authRoutes = ['/login', '/register'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some((route) => path === route);

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/modes', nextUrl.origin));
  }

  return NextResponse.next();
});
