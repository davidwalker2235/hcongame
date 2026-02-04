'use client';

import { Suspense } from "react";
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";

function LogoutContent() {
  const { isVerified, loading } = useUserVerification();

  // Mostrar loading mientras se verifica
  if (loading || isVerified === null || isVerified === false) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              Cargando...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          <p className={styles.text}>
            Contenido de la pestaña Cerrar sesión
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Logout() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              Cargando...
            </p>
          </div>
        </main>
      </div>
    }>
      <LogoutContent />
    </Suspense>
  );
}
