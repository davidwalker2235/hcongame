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
   Esto crea `.env.local` desde la plantilla. **Rellena los valores** con las credenciales de Firebase (Firebase Console o tu equipo). Las credenciales **no están en el repositorio**; ver [SECRETS.md](./SECRETS.md) para dónde obtenerlas y configurarlas en Vercel.

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Variables de Entorno

Las credenciales **no están en el código** ni se suben a GitHub. Para desarrollo local y producción:

- **Desarrollo:** `npm run setup:env` crea `.env.local`; rellena los valores (ver [SECRETS.md](./SECRETS.md)).
- **Producción (Vercel):** configura las mismas variables en Vercel → Settings → Environment Variables. Ver [SECRETS.md](./SECRETS.md) para la lista exacta de keys y valores.
- El archivo `.env.local` está en `.gitignore` y **no** debe subirse a GitHub. La plantilla `.env.example` sí está en el repo (sin valores).

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