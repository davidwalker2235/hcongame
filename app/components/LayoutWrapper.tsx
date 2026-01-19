'use client';

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "./Navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNavigation, setShowNavigation] = useState(true);

  useEffect(() => {
    // Ocultar navegación en página principal y wrong-access
    const hideNavPaths = ['/', '/wrong-access'];
    const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('user_session_id') : null;
    const shouldHide = hideNavPaths.includes(pathname) || !sessionId;
    setShowNavigation(!shouldHide);
  }, [pathname]);

  return (
    <>
      {showNavigation && <Navigation />}
      {children}
    </>
  );
}
