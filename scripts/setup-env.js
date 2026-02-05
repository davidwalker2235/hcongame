#!/usr/bin/env node

/**
 * Script para crear .env.local a partir de .env.example (sin credenciales).
 * Las credenciales NUNCA deben estar en este fichero ni subirse a GitHub.
 *
 * Desarrollo local: copia .env.example a .env.local y rellena los valores
 * (obtén las credenciales en Firebase Console o de tu equipo).
 *
 * Ejecutar: npm run setup:env
 */

const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

const templateContent = `# Firebase Admin (desarrollo local)
# Rellena los valores desde Firebase Console → Project settings → Service accounts
# O pide las credenciales al equipo. NUNCA subas .env.local a GitHub.

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_DATABASE_URL=
`;

try {
  if (fs.existsSync(envLocalPath)) {
    console.log('⚠️  El archivo .env.local ya existe.');
    console.log('   Si quieres recrearlo, elimínalo primero.');
    process.exit(0);
  }

  let contentToWrite = templateContent;
  if (fs.existsSync(envExamplePath)) {
    contentToWrite = fs.readFileSync(envExamplePath, 'utf8');
    console.log('📄 Usando plantilla desde .env.example');
  }

  fs.writeFileSync(envLocalPath, contentToWrite, 'utf8');
  console.log('✅ Archivo .env.local creado.');
  console.log('');
  console.log('📝 Siguiente paso: abre .env.local y rellena los valores.');
  console.log('   Obtén las credenciales en Firebase Console → Configuración del proyecto.');
  console.log('   Para producción, configura las variables en Vercel (ver SECRETS.md).');
} catch (error) {
  console.error('❌ Error al crear .env.local:', error.message);
  process.exit(1);
}
