'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import styles from "./components/page.module.css";
import { Logo } from "./components/Logo";
import { useFirebaseDatabase } from "./hooks/useFirebaseDatabase";
import { useSessionId } from "./hooks/useSessionId";
import { useUserVerification } from "./hooks/useUserVerification";
import { AnimatedDots } from "./components/AnimatedDots";

function HomeContent() {
  const router = useRouter();
  const { sessionId, isInitialized } = useSessionId();
  const { updateData, loading } = useFirebaseDatabase();
  const { isVerified, userData } = useUserVerification();
  
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [registering, setRegistering] = useState(false);

  // Cargar datos existentes si el usuario ya tiene algunos datos pero faltan email/nickname
  useEffect(() => {
    if (userData && sessionId) {
      // Si ya tiene datos pero faltan email o nickname, pre-rellenar los campos si existen
      if (userData.nickname && typeof userData.nickname === 'string' && userData.nickname.trim() !== '') {
        setNickname(userData.nickname);
      }
      if (userData.email && typeof userData.email === 'string' && userData.email.trim() !== '') {
        setEmail(userData.email);
      }
    }
  }, [userData, sessionId]);

  // Verificar si el usuario ya tiene email y nickname completos
  useEffect(() => {
    if (!isInitialized) return;

    if (!sessionId) {
      router.push('/wrong-access');
      return;
    }

    // Si está verificado (tiene email y nickname), redirigir a levels
    if (isVerified === true) {
      router.push('/levels');
      return;
    }

    // Si no está verificado pero el ID existe, mostrar formulario
    // (esto se maneja con useUserVerification)
  }, [sessionId, isInitialized, isVerified, router]);

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
      // Actualizar solo los campos nickname y email del nodo existente
      await updateData(`users/${sessionId}`, {
        nickname: nickname.trim(),
        email: email.trim(),
      });
      // Redirigir a levels después del registro
      router.push('/levels');
    } catch (error) {
      console.error('Error registering user:', error);
      setEmailError('Error registering. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const isFormValid = nickname.trim() !== '' && email.trim() !== '' && !emailError;

  // Mostrar loading mientras se verifica el usuario
  if (loading || !isInitialized || isVerified === null) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              <AnimatedDots text="Loading..." />
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Si el usuario está verificado (tiene email y nickname), no deberíamos llegar aquí (se redirige)
  if (isVerified === true) {
    return null;
  }

  // Si no hay sessionId, redirigir a wrong-access
  if (!sessionId) {
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
                {registering ? <AnimatedDots text="[Registering...]" /> : '[Register]'}
              </button>
            </div>

            <p className={styles.terms}>
              By submitting your data, you agree to our <a href="https://www.betterask.erni/es-es/privacy-statement/" target="_blank" rel="noopener noreferrer">private Terms</a>.
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
              <AnimatedDots text="Loading..." />
            </p>
          </div>
        </main>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
