# hcongame

## Requisitos

- Node.js 18+
- Cuenta de Firebase
- Cuenta de Vercel (para despliegue)

## Instalación

1. Clona el repositorio y entra en la carpeta:
   ```bash
   git clone <tu-repositorio>
   cd hcongame
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura variables de entorno:
   ```bash
   npm run setup:env
   ```
   Se crea `.env.local` desde la plantilla. **Rellena los valores** con las credenciales de Firebase (Firebase Console → Configuración del proyecto). Las credenciales no están en el repositorio.

4. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

- **Desarrollo:** `.env.local` con las variables de Firebase (mismas keys que en `.env.example`). No subas `.env.local` a GitHub.
- **Producción (Vercel):** Settings → Environment Variables. Añade las mismas keys con los valores de Firebase.

Keys necesarias (valores en Firebase Console):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Despliegue (Vercel)

1. Conecta el repositorio de GitHub con Vercel.
2. Configura las variables de entorno en Vercel (Settings → Environment Variables).
3. Cada push a la rama principal desplegará automáticamente.

## Estructura del proyecto

```
app/
  ├── components/     # Componentes reutilizables
  ├── hooks/          # Hooks (API, Firebase, sesión, etc.)
  ├── lib/            # Firebase y API
  ├── about/          # Página About
  ├── levels/         # Niveles
  ├── login/          # Login
  ├── logout/         # Logout
  ├── ranking/        # Leaderboard
  ├── setup-users/    # Utilidad setup (token)
  └── wrong-access/   # Acceso no autorizado
```

## Tecnologías

- Next.js 14+ (App Router)
- React
- TypeScript
- Firebase Realtime Database
- Vercel (hosting)
