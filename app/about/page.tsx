'use client';

import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";

export default function About() {
  const { isVerified, userData, loading } = useUserVerification();

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
            soy el contenido de la tab About
          </p>
          {userData && (
            <div style={{ marginTop: '20px' }}>
              <p className={styles.text}>
                <strong>Nickname:</strong> {userData.nickname}
              </p>
              <p className={styles.text}>
                <strong>Email:</strong> {userData.email}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
