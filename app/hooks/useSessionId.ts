'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const SESSION_ID_KEY = 'user_session_id';
const SESSION_COOKIE_NAME = 'hcongame_session_id';

function getSessionIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|;\\s*)' + SESSION_COOKIE_NAME + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export const useSessionId = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedId = sessionStorage.getItem(SESSION_ID_KEY);
    const cookieId = getSessionIdFromCookie();
    const urlId = searchParams.get('id');
    const currentPath = pathname;

    if (urlId) {
      if (urlId !== storedId) {
        sessionStorage.setItem(SESSION_ID_KEY, urlId);
      }
      setSessionId(urlId);
      if (lastPathRef.current !== currentPath || window.location.search.includes('id=')) {
        window.history.replaceState({}, '', currentPath);
        lastPathRef.current = currentPath;
      }
    } else if (storedId) {
      setSessionId(storedId);
      lastPathRef.current = currentPath;
    } else if (cookieId) {
      sessionStorage.setItem(SESSION_ID_KEY, cookieId);
      setSessionId(cookieId);
      lastPathRef.current = currentPath;
    } else {
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
      document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`;
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
