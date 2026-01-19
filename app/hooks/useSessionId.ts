'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const SESSION_ID_KEY = 'user_session_id';

export const useSessionId = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Obtener ID de sessionStorage
    const storedId = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_ID_KEY) : null;
    
    // Si hay ID en la URL (primera vez), guardarlo en sessionStorage y limpiar URL
    const urlId = searchParams.get('id');
    
    if (urlId && urlId !== storedId) {
      // Nuevo ID en URL, guardarlo en sesión
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_ID_KEY, urlId);
        setSessionId(urlId);
        // Limpiar el ID de la URL sin recargar
        const newUrl = pathname;
        window.history.replaceState({}, '', newUrl);
      }
    } else if (storedId) {
      // Usar ID de sesión existente
      setSessionId(storedId);
    }
    
    setIsInitialized(true);
  }, [searchParams, pathname]);

  const clearSessionId = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_ID_KEY);
      setSessionId(null);
    }
  };

  return {
    sessionId,
    isInitialized,
    clearSessionId,
  };
};
