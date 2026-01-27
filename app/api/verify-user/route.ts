/**
 * API Route para verificación y sincronización de usuario
 * Puede ser llamada desde el cliente o desde Server Components
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAndSyncUserLevel } from '@/app/lib/server-utils';

export async function GET(request: NextRequest) {
  try {
    // Obtener sessionId de los query params o headers
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('id') || request.headers.get('x-session-id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verificar y sincronizar nivel
    const result = await verifyAndSyncUserLevel(sessionId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in verify-user API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verificar y sincronizar nivel
    const result = await verifyAndSyncUserLevel(sessionId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in verify-user API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
