import { NextResponse } from 'next/server';

export default function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // ── Detect admin subdomain ──────────────────────────────────────────
  // Matches: admin.localhost:3000  |  admin.yourdomain.com
  const isAdminSubdomain =
    hostname.startsWith('admin.localhost') ||
    hostname.startsWith('admin.');

  if (isAdminSubdomain) {
    // Already going to an /admin/* path — let it through
    if (pathname.startsWith('/admin')) {
      return NextResponse.next();
    }
    // Root "/" on admin subdomain → redirect to login
    const adminUrl = new URL(`/admin${pathname === '/' ? '/login' : pathname}`, request.url);
    return NextResponse.redirect(adminUrl);
  }

  // ── Main domain: block direct access to /admin/* ────────────────────
  // Anyone who tries yourdomain.com/admin gets redirected to homepage
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except static assets and Next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};