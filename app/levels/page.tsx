'use client';

import { useEffect } from "react";
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";

export default function Levels() {
  const { isVerified, loading } = useUserVerification();

  // Mostrar loading mientras se verifica
  if (loading || isVerified === null || isVerified === false) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              Loading...
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
            soy el contenido de la tab Levels
          </p>
        </div>
      </main>
    </div>
  );
}
