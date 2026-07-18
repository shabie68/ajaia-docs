import { NextResponse } from 'next/server';

export default async function proxy(request: Request) {
  const url = new URL(request.url);
  
  // Fast check: Does the NextAuth session cookie exist?
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Secure-next-auth.session-token')?.value;

  const isAuthenticated = !!sessionToken; // true if cookie exists, false if not

  // Protect dashboard and editor routes
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/editor')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', url.origin));
    }
  }

  // Redirect logged-in users away from login page
  if (url.pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', url.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*', '/login'],
};