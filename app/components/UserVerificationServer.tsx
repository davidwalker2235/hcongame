/**
 * Ejemplo de Server Component que verifica y sincroniza el nivel del usuario
 * 
 * NOTA: Este componente requiere que el sessionId esté disponible en cookies o headers
 * Para usarlo, necesitarías modificar useSessionId para también guardar en cookies
 */

import { cookies } from 'next/headers';
import { verifyAndSyncUserLevel } from '@/app/lib/server-utils';
import { redirect } from 'next/navigation';

interface UserVerificationServerProps {
  sessionId?: string;
  redirectTo?: string;
}

/**
 * Server Component que verifica el usuario y sincroniza el nivel
 * 
 * Uso:
 * ```tsx
 * <UserVerificationServer sessionId={sessionId} />
 * ```
 * 
 * O si el sessionId está en cookies:
 * ```tsx
 * <UserVerificationServer />
 * ```
 */
export async function UserVerificationServer({
  sessionId: propSessionId,
  redirectTo,
}: UserVerificationServerProps) {
  // Intentar obtener sessionId de cookies si no se proporciona como prop
  let sessionId = propSessionId;
  
  if (!sessionId) {
    const cookieStore = await cookies();
    sessionId = cookieStore.get('user_session_id')?.value || null;
  }

  if (!sessionId) {
    // No hay sessionId, redirigir a wrong-access
    redirect('/wrong-access');
  }

  // Verificar y sincronizar nivel del usuario
  const result = await verifyAndSyncUserLevel(sessionId);

  if (!result.userData) {
    // Usuario no encontrado
    redirect('/wrong-access');
  }

  if (!result.isVerified) {
    // Usuario no verificado (falta email o nickname)
    if (redirectTo !== '/') {
      redirect('/');
    }
    return null;
  }

  // Usuario verificado, nivel sincronizado si era necesario
  // El componente puede continuar renderizando
  return null;
}
