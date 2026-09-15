import { NextRequest, NextResponse } from 'next/server';

const sessionCookie = 'idx_sentinel_session';

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(sessionCookie)?.value);
  if (hasSession) return NextResponse.next();
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!login|signup|api/auth|api/health|_next/static|_next/image|favicon.ico).*)'],
};
