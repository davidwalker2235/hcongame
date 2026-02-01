# Configuración de credenciales y secrets

Las credenciales de Firebase **no deben estar en el código** ni en ficheros que se suban a GitHub. Este documento indica dónde configurarlas y qué claves usar.

---

## ¿Dónde poner los secrets?

| Uso | Dónde configurarlos |
|-----|---------------------|
| **Despliegue en Vercel (producción)** | **Vercel** → proyecto → Settings → Environment Variables |
| **Desarrollo local** | Fichero `.env.local` en la raíz (no se sube a GitHub) |
| **CI/CD en GitHub (Actions)** | GitHub → repo → Settings → Secrets and variables → Actions (solo si tus workflows necesitan las credenciales) |

**Recomendación:** Para este proyecto el despliegue es en Vercel, así que **configura las variables en Vercel**. En GitHub no hace falta poner los secrets de Firebase a menos que tengas un workflow (por ejemplo, tests o builds) que los use.

---

## Variables a configurar

### Firebase (cliente y build)

Estas variables se usan en el build y en el cliente (Next.js las expone con el prefijo `NEXT_PUBLIC_`). Configúralas tanto en **Vercel** como en tu **.env.local** para desarrollo.

| Nombre (key) | Descripción | Ejemplo de valor |
|--------------|-------------|------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API Key de Firebase | (string tipo `AIza...`) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Auth | `tu-proyecto.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | URL de Realtime Database | `https://tu-proyecto-default-rtdb.europe-west1.firebasedatabase.app` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto | `tu-proyecto` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de Storage | `tu-proyecto.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID (numérico) | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | `1:123456789012:web:abc123...` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ID de Analytics (opcional) | `G-XXXXXXXXXX` |

**Dónde obtener los valores:** Firebase Console → tu proyecto → ⚙️ Configuración del proyecto → Tus apps → tu app web (o “Configuración general”).

---

## Vercel (producción)

1. Entra en [Vercel](https://vercel.com) → tu proyecto.
2. **Settings** → **Environment Variables**.
3. Añade cada variable de la tabla anterior:
   - **Name:** el nombre exacto (ej. `NEXT_PUBLIC_FIREBASE_API_KEY`).
   - **Value:** el valor (pega desde Firebase Console).
   - **Environment:** marca al menos **Production** (y Preview/Development si quieres usarlas en previews).
4. Guarda. Los próximos despliegues usarán estas variables.

No hace falta volver a tocar el código: la app ya lee estas variables desde `process.env` en `app/lib/firebase.ts`.

---

## Desarrollo local

1. Copia la plantilla:
   ```bash
   npm run setup:env
   ```
   Esto crea `.env.local` a partir de `.env.example` (o una plantilla vacía).
2. Abre `.env.local` y rellena los valores con las credenciales de Firebase (o pídelas al equipo).
3. **No subas `.env.local` a GitHub** (está en `.gitignore`).

---

## GitHub Secrets (opcional)

Solo necesitas **GitHub Secrets** si tienes workflows en GitHub Actions que usen las credenciales (por ejemplo, un job que ejecute el script de setup o que haga un build con env vars).

Si es así:

1. Repo → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret**.
3. Crea un secret por variable (ej. `FIREBASE_API_KEY`) y usa su valor en el workflow con `${{ secrets.FIREBASE_API_KEY }}`.

Para este proyecto, si el build y el deploy son solo en Vercel, **no es necesario** configurar nada en GitHub Secrets para Firebase.

---

## Resumen

- **Producción (Vercel):** configura en Vercel → Settings → Environment Variables las 8 variables `NEXT_PUBLIC_FIREBASE_*` con los valores de Firebase Console.
- **Local:** `npm run setup:env`, luego rellena `.env.local` con los mismos nombres y valores.
- **Código:** el script `scripts/setup-env.js` ya no contiene credenciales; solo genera `.env.local` desde `.env.example` o una plantilla vacía.
