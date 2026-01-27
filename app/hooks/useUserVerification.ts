'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFirebaseDatabase } from './useFirebaseDatabase';
import { useSessionId } from './useSessionId';
import { useApi } from './useApi';

interface ChallengeResponse {
  level: number;
  difficulty: string;
  story: string;
}

export const useUserVerification = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { sessionId, isInitialized } = useSessionId();
  const { read, updateData, loading } = useFirebaseDatabase();
  const { executeGet } = useApi<ChallengeResponse>(sessionId || undefined);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const previousIdRef = useRef<string | null>(null);
  const isVerifyingRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Esperar a que el ID de sesión esté inicializado
    if (!isInitialized) return;

    // Resetear estado cuando cambia el ID
    if (previousIdRef.current !== sessionId) {
      setIsVerified(null);
      setUserData(null);
      previousIdRef.current = sessionId;
      hasRedirectedRef.current = false;
    }

    const verifyUser = async () => {
      // Evitar múltiples verificaciones simultáneas
      if (isVerifyingRef.current || hasRedirectedRef.current) return;
      
      // Si no hay ID, redirigir a wrong-access
      if (!sessionId) {
        if (pathname !== '/wrong-access') {
          hasRedirectedRef.current = true;
          router.push('/wrong-access');
        }
        return;
      }

      isVerifyingRef.current = true;

      try {
        const data = await read(`users/${sessionId}`);
        
        // Si el ID no existe en Firebase, redirigir a wrong-access
        if (!data) {
          if (pathname !== '/wrong-access') {
            hasRedirectedRef.current = true;
            router.push('/wrong-access');
          }
          setIsVerified(false);
          return;
        }

        // El ID existe, verificar si tiene email y nickname
        const hasEmail = data.email && typeof data.email === 'string' && data.email.trim() !== '';
        const hasNickname = data.nickname && typeof data.nickname === 'string' && data.nickname.trim() !== '';

        if (hasEmail && hasNickname) {
          // Tiene email y nickname, verificar challenge actual
          setUserData(data);
          setIsVerified(true);
          
          // Llamar a la API para obtener el challenge actual
          try {
            const challengeResponse = await executeGet(`/challenge/0`);
            
            if (challengeResponse && challengeResponse.level !== undefined) {
              // Comparar el level de la API con el currentLevel del usuario
              const currentLevel = data.currentLevel ?? null;
              
              if (challengeResponse.level !== currentLevel) {
                // Actualizar el currentLevel en Firebase
                await updateData(`users/${sessionId}`, {
                  currentLevel: challengeResponse.level
                });
                
                // Actualizar también el userData local
                setUserData({
                  ...data,
                  currentLevel: challengeResponse.level
                });
              }
            }
          } catch (error) {
            // Si hay error en la llamada a la API, continuar sin actualizar
            console.error('Error fetching challenge:', error);
          }
          
          // Si estamos en la página principal o wrong-access, redirigir a levels
          if (pathname === '/' || pathname === '/wrong-access') {
            hasRedirectedRef.current = true;
            router.push('/levels');
          }
        } else {
          // No tiene email o nickname, redirigir a página principal para registro
          setUserData(data);
          setIsVerified(false);
          
          if (pathname !== '/') {
            hasRedirectedRef.current = true;
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        // En caso de error, redirigir a wrong-access
        if (pathname !== '/wrong-access') {
          hasRedirectedRef.current = true;
          router.push('/wrong-access');
        }
        setIsVerified(false);
      } finally {
        isVerifyingRef.current = false;
      }
    };

    verifyUser();
  }, [sessionId, isInitialized, read, updateData, executeGet, router, pathname]);

  return {
    id: sessionId,
    isVerified,
    userData,
    loading: loading || !isInitialized,
  };
};
