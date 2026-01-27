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
    
    // Función helper para guardar el ID en sessionStorage y cookies
    const saveSessionId = (id: string) => {
      sessionStorage.setItem(SESSION_ID_KEY, id);
      // También guardar en cookie para que el middleware pueda acceder
      document.cookie = `${SESSION_ID_KEY}=${id}; path=/; SameSite=Lax`;
    };

    // Siempre limpiar el ID de la URL si está presente
    if (urlId) {
      // Guardar el ID en sessionStorage y cookie (actualizar si es diferente)
      if (urlId !== storedId) {
        saveSessionId(urlId);
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
      // Asegurarse de que también esté en cookie
      const cookieId = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${SESSION_ID_KEY}=`))
        ?.split('=')[1];
      
      if (storedId !== cookieId) {
        // Sincronizar cookie con sessionStorage
        document.cookie = `${SESSION_ID_KEY}=${storedId}; path=/; SameSite=Lax`;
      }
      
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
        // Hay ID en la URL, guardarlo en sessionStorage y cookie, y limpiar URL
        sessionStorage.setItem(SESSION_ID_KEY, urlId);
        document.cookie = `${SESSION_ID_KEY}=${urlId}; path=/; SameSite=Lax`;
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
      // También eliminar la cookie
      document.cookie = `${SESSION_ID_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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
