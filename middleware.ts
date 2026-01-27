import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAndSyncUserLevel } from './app/lib/server-utils';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Rutas que no requieren verificación
  const publicPaths = ['/wrong-access', '/api'];
  
  // Si es una ruta pública o API, no hacer nada
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Obtener sessionId de la URL o cookies
  const urlSessionId = searchParams.get('id');
  const cookieSessionId = request.cookies.get('user_session_id')?.value;
  const sessionId = urlSessionId || cookieSessionId;

  // Si hay sessionId, verificar y sincronizar el nivel
  if (sessionId) {
    try {
      // Verificar y sincronizar nivel (solo si el usuario está verificado)
      // Esta función solo actualiza si el usuario tiene email y nickname
      await verifyAndSyncUserLevel(sessionId);
    } catch (error) {
      // Si hay error, continuar sin bloquear la request
      console.error('Error in middleware verification:', error);
    }

    // Si el sessionId viene de la URL, guardarlo en cookie para futuras requests
    if (urlSessionId && urlSessionId !== cookieSessionId) {
      const response = NextResponse.next();
      response.cookies.set('user_session_id', urlSessionId, {
        path: '/',
        sameSite: 'lax',
        // No usar httpOnly para que el cliente también pueda leerlo
      });
      return response;
    }
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
