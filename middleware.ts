import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  // Rutas que no requieren ID
  const publicPaths = ['/wrong-access'];
  
  // Si no es una ruta pública y no hay ID, redirigir a wrong-access
  if (!publicPaths.includes(pathname) && !id) {
    return NextResponse.redirect(new URL('/wrong-access', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
