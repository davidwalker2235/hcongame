'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFirebaseDatabase } from './useFirebaseDatabase';
import { useSessionId } from './useSessionId';

export const useUserVerification = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { sessionId, isInitialized } = useSessionId();
  const { read, loading } = useFirebaseDatabase();
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
          // Tiene email y nickname, redirigir a levels
          setUserData(data);
          setIsVerified(true);
          
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
  }, [sessionId, isInitialized, read, router, pathname]);

  return {
    id: sessionId,
    isVerified,
    userData,
    loading: loading || !isInitialized,
  };
};
