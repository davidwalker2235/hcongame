



'use client';

import { Suspense } from 'react';
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";
import { ErniLogo } from '../components/ErniLogo';



function AboutContent() {
  const { isVerified, userData, loading } = useUserVerification();

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
          <div className={styles.asciiLogoWrapper}>
            <ErniLogo />
          </div>
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

export default function About() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              Loading...
            </p>
          </div>
        </main>
      </div>
    }>
      <AboutContent />
    </Suspense>
  );
}
