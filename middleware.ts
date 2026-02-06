import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'hcongame_session_id';

const PROTECTED_PATHS = ['/', '/levels', '/about', '/ranking', '/login'];
const API_BASE_URL = 'https://ernibots-api.enricd.com';

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.includes(pathname);
}

async function validateToken(token: string): Promise<{ status: number; level?: number | "new" }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return { status: response.status };
    }
    const data = (await response.json()) as { level?: number | "new" };
    return { status: 200, level: data.level };
  } catch {
    return { status: 500 };
  }
}

function withSessionCookie(
  response: NextResponse,
  tokenFromUrl: string | null,
  token: string
): NextResponse {
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

/**
 * Valida el token contra /auth para decidir redirecciones en SSR.
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

  const validation = await validateToken(token);
  if (validation.status === 401) {
    return NextResponse.redirect(new URL('/wrong-access', request.url));
  }
  if (validation.status !== 200) {
    return NextResponse.redirect(new URL('/wrong-access', request.url));
  }

  const level = validation.level;
  if ((level === "new" || level === 0) && pathname !== '/') {
    const redirect = NextResponse.redirect(new URL('/', request.url));
    return withSessionCookie(redirect, tokenFromUrl, token);
  }
  if (typeof level === 'number' && level > 0 && pathname === '/') {
    const redirect = NextResponse.redirect(new URL('/levels', request.url));
    return withSessionCookie(redirect, tokenFromUrl, token);
  }

  const response = NextResponse.next();
  return withSessionCookie(response, tokenFromUrl, token);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
