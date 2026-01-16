import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For API routes, add connection header from cookie/session
  if (request.nextUrl.pathname.startsWith('/api')) {
    // In production, use proper session management
    // For now, we'll rely on client-side sessionStorage
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};