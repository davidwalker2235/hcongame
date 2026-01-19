'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirebaseDatabase } from './useFirebaseDatabase';

export const useUserVerification = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const { read, loading } = useFirebaseDatabase();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const previousIdRef = useRef<string | null>(null);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    // Resetear estado cuando cambia el ID
    if (previousIdRef.current !== id) {
      setIsVerified(null);
      setUserData(null);
      previousIdRef.current = id;
    }

    const verifyUser = async () => {
      // Evitar múltiples verificaciones simultáneas
      if (isVerifyingRef.current) return;
      
      // Si no hay ID, redirigir a wrong-access
      if (!id) {
        router.push('/wrong-access');
        return;
      }

      isVerifyingRef.current = true;

      try {
        const data = await read(`users/${id}`);
        if (!data) {
          // Usuario no existe, redirigir a página principal para registro
          router.push(`/?id=${id}`);
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
  }, [id, read, router]);

  return {
    id,
    isVerified,
    userData,
    loading,
  };
};
