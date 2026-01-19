'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseDatabase } from './useFirebaseDatabase';
import { useSessionId } from './useSessionId';

export const useUserVerification = () => {
  const router = useRouter();
  const { sessionId, isInitialized } = useSessionId();
  const { read, loading } = useFirebaseDatabase();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const previousIdRef = useRef<string | null>(null);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    // Esperar a que el ID de sesión esté inicializado
    if (!isInitialized) return;

    // Resetear estado cuando cambia el ID
    if (previousIdRef.current !== sessionId) {
      setIsVerified(null);
      setUserData(null);
      previousIdRef.current = sessionId;
    }

    const verifyUser = async () => {
      // Evitar múltiples verificaciones simultáneas
      if (isVerifyingRef.current) return;
      
      // Si no hay ID, redirigir a wrong-access
      if (!sessionId) {
        router.push('/wrong-access');
        return;
      }

      isVerifyingRef.current = true;

      try {
        const data = await read(`users/${sessionId}`);
        if (!data) {
          // Usuario no existe, redirigir a página principal para registro
          router.push('/');
          setIsVerified(false);
        } else {
          // Usuario existe
          setUserData(data);
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        // En caso de error, redirigir a wrong-access
        router.push('/wrong-access');
        setIsVerified(false);
      } finally {
        isVerifyingRef.current = false;
      }
    };

    verifyUser();
  }, [sessionId, isInitialized, read, router]);

  return {
    id: sessionId,
    isVerified,
    userData,
    loading: loading || !isInitialized,
  };
};
