'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const SESSION_ID_KEY = 'user_session_id';

export const useSessionId = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Obtener ID de sessionStorage
    const storedId = sessionStorage.getItem(SESSION_ID_KEY);
    
    // Si hay ID en la URL (cualquier momento), guardarlo en sessionStorage y limpiar URL
    const urlId = searchParams.get('id');
    const currentPath = pathname;
    
    // Siempre limpiar el ID de la URL si está presente
    if (urlId) {
      // Guardar el ID en sessionStorage (actualizar si es diferente)
      if (urlId !== storedId) {
        sessionStorage.setItem(SESSION_ID_KEY, urlId);
      }
      setSessionId(urlId);
      
      // Limpiar el ID de la URL siempre que esté presente
      // Solo limpiar si el pathname cambió o es la primera vez
      if (lastPathRef.current !== currentPath || window.location.search.includes('id=')) {
        const newUrl = currentPath;
        window.history.replaceState({}, '', newUrl);
        lastPathRef.current = currentPath;
      }
    } else if (storedId) {
      // No hay ID en URL pero hay uno en sessionStorage, usarlo
      setSessionId(storedId);
      lastPathRef.current = currentPath;
    } else {
      // No hay ID ni en URL ni en sessionStorage
      setSessionId(null);
      lastPathRef.current = currentPath;
    }
    
    setIsInitialized(true);
  }, [searchParams, pathname]);

  // Verificar periódicamente si hay ID en la URL (por si se añade manualmente)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndCleanId = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get('id');
      
      if (urlId) {
        // Hay ID en la URL, guardarlo y limpiar
        sessionStorage.setItem(SESSION_ID_KEY, urlId);
        setSessionId(urlId);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    };

    // Verificar inmediatamente
    checkAndCleanId();
    
    // Verificar periódicamente (cada 200ms) por si se añade manualmente
    const checkInterval = setInterval(checkAndCleanId, 200);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  const clearSessionId = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_ID_KEY);
      setSessionId(null);
      lastPathRef.current = '';
    }
  };

  return {
    sessionId,
    isInitialized,
    clearSessionId,
  };
};
