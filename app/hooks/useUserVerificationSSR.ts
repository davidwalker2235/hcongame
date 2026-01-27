/**
 * Versión alternativa de useUserVerification que usa la API route de servidor
 * Esta versión delega la lógica al servidor, mejorando el rendimiento y SEO
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSessionId } from './useSessionId';

interface VerifyUserResponse {
  userData: any;
  isVerified: boolean;
  levelUpdated: boolean;
  error?: string;
}

export const useUserVerificationSSR = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { sessionId, isInitialized } = useSessionId();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
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
        setIsVerified(false);
        setLoading(false);
        return;
      }

      isVerifyingRef.current = true;
      setLoading(true);

      try {
        // Llamar a la API route de servidor
        const response = await fetch(`/api/verify-user?id=${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: VerifyUserResponse = await response.json();

        if (result.error === 'User not found') {
          // El ID no existe en Firebase, redirigir a wrong-access
          if (pathname !== '/wrong-access') {
            hasRedirectedRef.current = true;
            router.push('/wrong-access');
          }
          setIsVerified(false);
          setUserData(null);
          return;
        }

        setUserData(result.userData);
        setIsVerified(result.isVerified);

        if (result.isVerified) {
          // Si estamos en la página principal o wrong-access, redirigir a levels
          if (pathname === '/' || pathname === '/wrong-access') {
            hasRedirectedRef.current = true;
            router.push('/levels');
          }
        } else {
          // No tiene email o nickname, redirigir a página principal para registro
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
        setUserData(null);
      } finally {
        isVerifyingRef.current = false;
        setLoading(false);
      }
    };

    verifyUser();
  }, [sessionId, isInitialized, router, pathname]);

  return {
    id: sessionId,
    isVerified,
    userData,
    loading: loading || !isInitialized,
  };
};
