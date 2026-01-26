'use client';

import { Suspense } from "react";
import styles from "../components/page.module.css";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProtectedPage } from "../components/ProtectedPage";

function LoginContent() {

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          <p className={styles.text}>
            soy el contenido de la tab Log in
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedPage>
        <LoginContent />
      </ProtectedPage>
    </Suspense>
  );
}
