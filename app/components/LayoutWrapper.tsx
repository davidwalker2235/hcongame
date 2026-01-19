'use client';

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "./Navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showNavigation, setShowNavigation] = useState(true);

  useEffect(() => {
    // Ocultar navegación en página principal, wrong-access y cuando no hay ID
    const hideNavPaths = ['/', '/wrong-access'];
    const id = searchParams.get('id');
    const shouldHide = hideNavPaths.includes(pathname) || !id;
    setShowNavigation(!shouldHide);
  }, [pathname, searchParams]);

  return (
    <>
      {showNavigation && <Navigation />}
      {children}
    </>
  );
}
