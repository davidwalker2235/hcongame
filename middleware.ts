import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'hcongame_session_id';

const PROTECTED_PATHS = ['/', '/levels', '/about', '/ranking', '/login'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.includes(pathname);
}

/**
 * Solo comprueba que exista un token (id en URL o cookie).
 * No se llama a la API aquí: la validación (Firebase + nickname/email + /challenge/0)
 * se hace en useUserVerification para no llamar a la API hasta tener nickname y email.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const tokenFromUrl = request.nextUrl.searchParams.get('id');
  const tokenFromCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const token = tokenFromUrl || tokenFromCookie || null;

  if (!token) {
    return NextResponse.redirect(new URL('/wrong-access', request.url));
  }

  const response = NextResponse.next();

  if (tokenFromUrl) {
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
