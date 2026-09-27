import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('nb_auth_token')?.value;

    // Login page
    if (pathname === '/admin/login') {
      // If already logged in with a token, redirect to dashboard
      if (token) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // All other /admin/* routes require a valid token cookie
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
