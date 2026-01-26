



'use client';

import { Suspense } from 'react';
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";
import { ErniLogo } from '../components/ErniLogo';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProtectedPage } from '../components/ProtectedPage';

function AboutContent() {
  const { userData } = useUserVerification();

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
                <strong>Hi</strong> {userData.nickname}
              </p>
              <p className={styles.text}>
              We are ERNI. Since 1994, we have focused on advising companies on Innovation and Technology, with the aim of boosting their performance through software development and the digitalization of their critical business processes, thus laying the foundations for a digital future.

The key to success is the mindset of our ERNIans, shaped by the values and virtues that define us. We work side by side with our clients to help them become more efficient and innovative than their competitors, forming partnerships based on genuine values to achieve ambitious goals.
              </p>
            </div>
          )}
          <div style={{ marginTop: '20px' }}>
            Follow us!
            <div className={styles.followLinks}>
              <a href="https://www.linkedin.com/company/erni/posts/?feedView=all" target="_blank" rel="noreferrer">[LinkedIn]</a>
              <a href="https://www.instagram.com/ernigroup/" target="_blank" rel="noreferrer">[Intagram]</a>
              <a href="https://www.youtube.com/@erniacademy" target="_blank" rel="noreferrer">[Youtube]</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function About() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedPage>
        <AboutContent />
      </ProtectedPage>
    </Suspense>
  );
}
