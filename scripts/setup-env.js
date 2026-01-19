#!/usr/bin/env node

/**
 * Script para crear el archivo .env.local con las credenciales de Firebase
 * Ejecutar: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Firebase Configuration
# Estas credenciales son solo para desarrollo local
# NO subir este archivo a GitHub

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA_JkZn_b6HHf2-uJPgNds3GfR0_S2Adlw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hcongame.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://hcongame-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hcongame
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hcongame.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=829949342689
NEXT_PUBLIC_FIREBASE_APP_ID=1:829949342689:web:755e90fd716ae3c6a7d8a0
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-8ET4X61V69
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  // Verificar si el archivo ya existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo .env.local ya existe.');
    console.log('   Si quieres recrearlo, elimínalo primero.');
    process.exit(0);
  }

  // Crear el archivo .env.local
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Archivo .env.local creado exitosamente!');
  console.log('   Las credenciales de Firebase están configuradas para desarrollo local.');
  console.log('');
  console.log('📝 Recuerda:');
  console.log('   - El archivo .env.local está en .gitignore y NO se subirá a GitHub');
  console.log('   - Para producción, configura las variables en Vercel');
  console.log('   - Ver DEPLOYMENT.md para más información');
} catch (error) {
  console.error('❌ Error al crear el archivo .env.local:', error.message);
  process.exit(1);
}
