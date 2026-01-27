# Verificación de Usuario en Server Side Rendering (SSR)

Este documento explica las diferentes opciones para hacer la verificación y sincronización del nivel del usuario en Server Side Rendering.

## Opciones Disponibles

### 1. API Route (Recomendado para migración gradual)

**Archivo:** `app/api/verify-user/route.ts`

Esta API route puede ser llamada desde el cliente y ejecuta toda la lógica en el servidor.

**Ventajas:**
- ✅ No requiere cambios en cómo se maneja el sessionId (sigue usando sessionStorage)
- ✅ Fácil de implementar
- ✅ La lógica se ejecuta en el servidor
- ✅ Puede ser llamada desde cualquier componente cliente

**Uso:**

```tsx
// En un componente cliente
const response = await fetch(`/api/verify-user?id=${sessionId}`);
const result = await response.json();
```

**Hook alternativo:** `app/hooks/useUserVerificationSSR.ts`

Este hook usa la API route internamente:

```tsx
import { useUserVerificationSSR } from './hooks/useUserVerificationSSR';

function MyComponent() {
  const { isVerified, userData, loading } = useUserVerificationSSR();
  // ...
}
```

### 2. Funciones de Servidor Directas

**Archivo:** `app/lib/server-utils.ts`

Funciones que pueden ser usadas directamente en Server Components, API Routes o Middleware.

**Funciones disponibles:**
- `getUserData(sessionId)`: Lee datos del usuario desde Firebase
- `updateUserCurrentLevel(sessionId, level)`: Actualiza el currentLevel
- `getChallengeFromApi(sessionId)`: Obtiene el challenge desde la API
- `verifyAndSyncUserLevel(sessionId)`: Función completa que hace todo el proceso

**Uso en Server Component:**

```tsx
import { verifyAndSyncUserLevel } from '@/app/lib/server-utils';
import { cookies } from 'next/headers';

export default async function MyServerComponent() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('user_session_id')?.value;
  
  if (!sessionId) {
    redirect('/wrong-access');
  }
  
  const result = await verifyAndSyncUserLevel(sessionId);
  // Usar result.userData, result.isVerified, etc.
}
```

**Uso en API Route:**

```tsx
import { verifyAndSyncUserLevel } from '@/app/lib/server-utils';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('id');
  const result = await verifyAndSyncUserLevel(sessionId);
  return NextResponse.json(result);
}
```

### 3. Server Component Helper

**Archivo:** `app/components/UserVerificationServer.tsx`

Un componente de servidor que verifica y sincroniza automáticamente.

**Uso:**

```tsx
import { UserVerificationServer } from '@/app/components/UserVerificationServer';

export default function Layout({ children }) {
  return (
    <>
      <UserVerificationServer />
      {children}
    </>
  );
}
```

**Nota:** Requiere que el sessionId esté disponible en cookies. Ver sección "Configuración de Cookies" más abajo.

### 4. Middleware (Requiere Cookies)

Para usar en middleware, necesitarías modificar `useSessionId` para también guardar en cookies.

**Ejemplo de middleware:**

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { verifyAndSyncUserLevel } from '@/app/lib/server-utils';

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('user_session_id')?.value;
  
  if (!sessionId) {
    // Manejar redirección según la ruta
    return NextResponse.next();
  }
  
  // Verificar y sincronizar (opcional, puede ser costoso en cada request)
  // Mejor hacerlo solo en rutas específicas
  if (request.nextUrl.pathname.startsWith('/levels')) {
    const result = await verifyAndSyncUserLevel(sessionId);
    // Usar result según sea necesario
  }
  
  return NextResponse.next();
}
```

## Configuración de Cookies (Opcional)

Para usar Server Components o Middleware, necesitarías modificar `useSessionId` para también guardar en cookies:

```tsx
// En useSessionId.ts
useEffect(() => {
  if (typeof window === 'undefined') return;
  
  const storedId = sessionStorage.getItem(SESSION_ID_KEY);
  const urlId = searchParams.get('id');
  
  if (urlId || storedId) {
    const id = urlId || storedId;
    // Guardar en sessionStorage (existente)
    sessionStorage.setItem(SESSION_ID_KEY, id);
    
    // También guardar en cookie para SSR
    document.cookie = `user_session_id=${id}; path=/; SameSite=Lax`;
  }
}, [searchParams]);
```

## Recomendación

Para una migración gradual sin romper el código existente:

1. **Usa la API Route** (`/api/verify-user`) desde el hook actual
2. **O usa el hook `useUserVerificationSSR`** que internamente llama a la API route
3. Esto mantiene la compatibilidad con sessionStorage mientras ejecuta la lógica en el servidor

Para una solución completamente SSR:

1. **Modifica `useSessionId`** para también usar cookies
2. **Usa las funciones de `server-utils.ts`** directamente en Server Components
3. **O usa el componente `UserVerificationServer`** en el layout

## Comparación

| Opción | SSR Completo | Requiere Cookies | Cambios en Código Existente |
|--------|--------------|------------------|----------------------------|
| API Route | ✅ (lógica en servidor) | ❌ | Mínimos |
| useUserVerificationSSR | ✅ (lógica en servidor) | ❌ | Cambiar import del hook |
| server-utils.ts directo | ✅✅ | ✅ (para Server Components) | Moderados |
| UserVerificationServer | ✅✅ | ✅ | Moderados |
| Middleware | ✅✅ | ✅ | Altos |
