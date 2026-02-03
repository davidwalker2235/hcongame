import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://ernibots-api.enricd.com';
const SESSION_COOKIE_NAME = 'hcongame_session_id';

const PROTECTED_PATHS = ['/', '/levels', '/about', '/ranking', '/login'];

/** TTL en ms: 1 minuto. Evita llamar a la API en cada petición (document, RSC, prefetch). */
const VALIDATION_CACHE_TTL_MS = 60 * 1000;

const validationCache = new Map<
  string,
  { valid: boolean; expiresAt: number }
>();

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.includes(pathname);
}

async function validateTokenWithApi(token: string): Promise<boolean> {
  try {
    const url = `${API_BASE_URL.replace(/\/$/, '')}/challenge/0`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function isTokenValid(token: string): Promise<boolean> {
  const now = Date.now();
  const cached = validationCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.valid;
  }
  const valid = await validateTokenWithApi(token);
  validationCache.set(token, {
    valid,
    expiresAt: now + VALIDATION_CACHE_TTL_MS,
  });
  return valid;
}

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

  const valid = await isTokenValid(token);
  if (!valid) {
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
