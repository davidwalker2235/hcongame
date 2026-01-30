import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fpkd59w7-8000.uks1.devtunnels.ms';
const SESSION_COOKIE_NAME = 'hcongame_session_id';

const PROTECTED_PATHS = ['/', '/levels', '/about', '/ranking', '/login'];

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

  const valid = await validateTokenWithApi(token);
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
