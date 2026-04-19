import { NextResponse } from 'next/server';

const COOKIE_NAME = 'adab_admin_token';

// Lightweight JWT check for Edge runtime (no Node.js crypto needed)
// We just verify the token exists and is not expired by decoding the payload
// Full signature verification happens in lib/auth.js on the server
function isTokenValid(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode the payload (base64url)
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;

    // Check it has expected fields
    if (!payload.id || !payload.username) return false;

    return true;
  } catch {
    return false;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes, skip /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token || !isTokenValid(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};