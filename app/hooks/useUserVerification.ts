'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSessionId } from './useSessionId';
import { useApi } from './useApi';

interface AuthResponse {
  level: number | "new";
  nickname?: string | null;
}

export const useUserVerification = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { sessionId, isInitialized } = useSessionId();
  const { executeGet, loading } = useApi<AuthResponse>(sessionId || undefined);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
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
      setCurrentLevel(null);
      setErrorMessage(null);
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
        const authResponse = await executeGet(`/auth`);
        if (!authResponse) {
          setErrorMessage("Error en servidor");
          setIsVerified(false);
          return;
        }

        setUserData({ nickname: authResponse.nickname ?? null });
        if (authResponse.level === "new" || authResponse.level === 0) {
          setIsVerified(false);
          if (pathname !== '/') {
            hasRedirectedRef.current = true;
            router.push('/');
          }
          return;
        }

        const levelNumber = Number(authResponse.level);
        if (!Number.isFinite(levelNumber)) {
          setErrorMessage("Error en servidor");
          setIsVerified(false);
          return;
        }

        setCurrentLevel(levelNumber);
        setIsVerified(true);

        if (pathname === '/' || pathname === '/wrong-access') {
          hasRedirectedRef.current = true;
          router.push('/levels');
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        if (error && typeof error === "object" && "status" in error && (error as any).status !== 401) {
          setErrorMessage("Error en servidor");
        }
        setIsVerified(false);
      } finally {
        isVerifyingRef.current = false;
      }
    };

    verifyUser();
  }, [sessionId, isInitialized, executeGet, router, pathname]);

  return {
    id: sessionId,
    isVerified,
    userData,
    loading: loading || !isInitialized,
    errorMessage,
    currentLevel,
  };
};
