'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import styles from "./components/page.module.css";
import { Logo } from "./components/Logo";
import { useFirebaseDatabase } from "./hooks/useFirebaseDatabase";
import { useSessionId } from "./hooks/useSessionId";

function HomeContent() {
  const router = useRouter();
  const { sessionId, isInitialized } = useSessionId();
  const { read, write, loading } = useFirebaseDatabase();
  
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [registering, setRegistering] = useState(false);

  // Verificar si el usuario existe cuando se carga la página
  useEffect(() => {
    if (!isInitialized) return;

    const checkUser = async () => {
      if (!sessionId) {
        router.push('/wrong-access');
        return;
      }

      try {
        const userData = await read(`users/${sessionId}`);
        if (userData) {
          // Usuario existe, redirigir a about
          router.push('/about');
        } else {
          // Usuario no existe, mostrar formulario
          setUserExists(false);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUserExists(false);
      }
    };

    checkUser();
  }, [sessionId, isInitialized, read, router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const handleRegister = async () => {
    if (!sessionId || !isFormValid) return;

    setRegistering(true);
    try {
      await write(`users/${sessionId}`, {
        nickname: nickname.trim(),
        email: email.trim(),
      });
      // Redirigir a about después del registro
      router.push('/about');
    } catch (error) {
      console.error('Error registering user:', error);
      setEmailError('Error registering. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const isFormValid = nickname.trim() !== '' && email.trim() !== '' && !emailError;

  // Mostrar loading mientras se verifica el usuario
  if (userExists === null || loading || !isInitialized) {
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

  // Si el usuario existe, no deberíamos llegar aquí (se redirige), pero por si acaso
  if (userExists) {
    return null;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <Logo />
        </h1>
        <div className={styles.content}>
          <p className={styles.text}>
            Welcome to ERNI
          </p>
          
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="nickname" className={styles.label}>Nickname</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={styles.input}
                placeholder="Enter your nickname"
                disabled={registering}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                placeholder="Enter your email"
                disabled={registering}
              />
              {emailError && <span className={styles.errorMessage}>{emailError}</span>}
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleRegister}
                className={`${styles.button} ${isFormValid && !registering ? styles.buttonActive : styles.buttonDisabled}`}
                disabled={!isFormValid || registering}
              >
                {registering ? '[Registering...]' : '[Register]'}
              </button>
            </div>

            <p className={styles.terms}>
              By submitting your data, you agree to our Terms of Service.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
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
      <HomeContent />
    </Suspense>
  );
}
