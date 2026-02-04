'use client';

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

let loginPromise: Promise<void> | null = null;
let didLogUid = false;

/**
 * Garantiza que Firebase Auth esté autenticado (cuenta de servicio).
 * Singleton: una sola promesa para evitar múltiples logins.
 * Usar solo en cliente (hooks, componentes con "use client").
 */
export function ensureFirebaseAuth(): Promise<void> {
  if (!loginPromise) {
    const user = process.env.NEXT_PUBLIC_FIREBASE_AUTH_USER ?? "";
    const password = process.env.NEXT_PUBLIC_FIREBASE_AUTH_PASSWORD ?? "";

    if (!user || !password) {
      const msg =
        "Firebase: faltan NEXT_PUBLIC_FIREBASE_AUTH_USER o NEXT_PUBLIC_FIREBASE_AUTH_PASSWORD en .env.local. Sin ellas auth es null y la Realtime Database devuelve PERMISSION_DENIED.";
      console.error(msg);
      loginPromise = Promise.reject(new Error(msg));
      return loginPromise;
    }

    if (auth.currentUser) {
      if (!didLogUid) {
        console.info("Firebase Auth UID:", auth.currentUser.uid);
        didLogUid = true;
      }
      loginPromise = Promise.resolve();
      return loginPromise;
    }

    loginPromise = signInWithEmailAndPassword(auth, user, password)
      .then((cred) => {
        const uid = cred.user?.uid;
        if (!uid) {
          throw new Error("Firebase Auth: sign-in sin UID.");
        }
        if (!didLogUid) {
          console.info("Firebase Auth UID:", uid);
          didLogUid = true;
        }
      })
      .catch((err) => {
        console.error("Firebase sign-in error:", err?.message ?? err);
        loginPromise = null; // permitir reintento
        throw err;
      });
  }
  return loginPromise;
}
