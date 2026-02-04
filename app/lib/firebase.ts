// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// Las variables de entorno deben tener el prefijo NEXT_PUBLIC_ para estar disponibles en el cliente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Nota: La validación de variables de entorno se omite aquí porque:
// 1. En Next.js, las variables NEXT_PUBLIC_ se inyectan en tiempo de build
// 2. Si las variables no están disponibles, Firebase fallará al inicializarse de todas formas
// 3. La validación en tiempo de importación puede dar falsos positivos en el cliente
// Si hay problemas con Firebase, se mostrarán errores al intentar usarlo

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

await signInWithEmailAndPassword(
  auth,
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_USER || "",
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_PASSWORD || ""
);

// Initialize Realtime Database
const database: Database = getDatabase(app);

export { app, database };
