/**
 * Utilidad para abrir enlaces de redes sociales: intenta abrir la app nativa en móvil
 * y, si no está instalada o falla, abre la URL web.
 */

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase());
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent || "");
}

/** Si la app se abre, la página puede pasar a segundo plano; cancelamos el fallback. */
const FALLBACK_DELAY_MS = 2000;

/**
 * Intenta abrir la app nativa con appUrl. Si tras FALLBACK_DELAY_MS la página sigue visible,
 * abre webUrl (p. ej. en nueva pestaña).
 */
export function openAppOrWeb(appUrl: string, webUrl: string): void {
  if (!isMobile()) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return;
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const openWeb = () => {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  };

  const cleanup = () => {
    if (timeoutId != null) clearTimeout(timeoutId);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      cleanup();
    }
  };

  document.addEventListener("visibilitychange", onVisibilityChange);

  timeoutId = setTimeout(() => {
    cleanup();
    if (document.visibilityState === "visible") {
      openWeb();
    }
  }, FALLBACK_DELAY_MS);

  try {
    window.location.href = appUrl;
  } catch {
    openWeb();
    cleanup();
  }
}

/** URLs de app (iOS / Android intent) y web para ERNI. Se calculan en el cliente al usar. */
export function getSocialLinks(): {
  instagram: { app: string; web: string };
  linkedin: { app: string; web: string };
  youtube: { app: string; web: string };
} {
  const android = isAndroid();
  return {
    instagram: {
      app: android
        ? "intent://www.instagram.com/_u/ernigroup/#Intent;package=com.instagram.android;scheme=https;end"
        : "instagram://user?username=ernigroup",
      web: "https://www.instagram.com/ernigroup/",
    },
    linkedin: {
      app: android
        ? "intent://www.linkedin.com/company/erni/#Intent;package=com.linkedin.android;scheme=https;end"
        : "linkedin://company/erni",
      web: "https://www.linkedin.com/company/erni/posts/?feedView=all",
    },
    youtube: {
      app: android
        ? "intent://www.youtube.com/@erniacademy#Intent;package=com.google.android.youtube;scheme=https;end"
        : "vnd.youtube://www.youtube.com/@erniacademy",
      web: "https://www.youtube.com/@erniacademy",
    },
  };
}
