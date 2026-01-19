# hcongame

## Configuración del Proyecto

### Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Firebase configurada
- Cuenta de Vercel (para despliegue)

### Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd hcongame
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   ```bash
   npm run setup:env
   ```
   O crea manualmente el archivo `.env.local` (ver sección de Variables de Entorno)

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Variables de Entorno

### Desarrollo Local

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=tu_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

**⚠️ IMPORTANTE:** El archivo `.env.local` está en `.gitignore` y NO debe subirse a GitHub.

### Producción (Vercel)

Las variables de entorno se configuran en el dashboard de Vercel. Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

## Despliegue

Para desplegar en Vercel, consulta la guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md).

### Pasos Rápidos:

1. Conecta tu repositorio de GitHub con Vercel
2. Configura las variables de entorno en Vercel (Settings → Environment Variables)
3. Vercel desplegará automáticamente en cada push a la rama principal

## Estructura del Proyecto

```
app/
  ├── components/     # Componentes reutilizables
  ├── hooks/          # Custom hooks (Firebase, sesión, etc.)
  ├── lib/            # Configuración de Firebase
  ├── about/          # Página About
  ├── levels/         # Página Levels
  ├── login/          # Página Login
  └── logout/         # Página Logout
```

## Tecnologías Utilizadas

- Next.js 14+ (App Router)
- React
- TypeScript
- Firebase Realtime Database
- Vercel (hosting)