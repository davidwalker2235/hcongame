'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import styles from "./components/page.module.css";
import { Logo } from "./components/Logo";
import { useFirebaseDatabase } from "./hooks/useFirebaseDatabase";
import { useSessionId } from "./hooks/useSessionId";
import { useUserVerification } from "./hooks/useUserVerification";
import { useApi } from "./hooks/useApi";
import { AnimatedDots } from "./components/AnimatedDots";

function HomeContent() {
  const router = useRouter();
  const { sessionId, isInitialized } = useSessionId();
  const { read, updateData, loading } = useFirebaseDatabase();
  const { isVerified, userData } = useUserVerification();
  const { executeGet } = useApi(sessionId);
  
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
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
      setEmailError('Formato de correo no válido');
    } else {
      setEmailError('');
    }
  };

  const handleRegister = async () => {
    if (!sessionId || !isFormValid) return;

    setRegistering(true);
    setNicknameError('');
    try {
      const users = await read<Record<string, { nickname?: string }>>('users');
      if (!users || !users[sessionId]) {
        router.push('/wrong-access');
        return;
      }
      const trimmedNickname = nickname.trim();
      const isTaken = users && Object.entries(users).some(
        ([id, data]) => id !== sessionId && data?.nickname?.trim() === trimmedNickname
      );
      if (isTaken) {
        setNicknameError('Este Nickname ya está en uso');
        return;
      }
      await updateData(`users/${sessionId}`, {
        nickname: trimmedNickname,
        email: email.trim(),
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/levels');
    } catch (error) {
      console.error('Error registering user:', error);
      setEmailError('Error al registrarse. Inténtalo de nuevo.');
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
              <AnimatedDots text="Cargando..." />
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
            Bienvenido al Desafío del Castillo ERNI-bots
          </p>
          <p className={styles.text}>Tu objetivo es hacer que los ERNI-Bots revelen la contraseña secreta de cada nivel. Sin embargo, los ERNI-Bots mejorarán las defensas tras cada acierto.</p>
          <p>
            <b style={{ color: 'red' }}>La mejor parte del CTF llega el sábado 7 de febrero a las 18:40.</b> Enviaremos un correo a los 3 ganadores del CTF. Pásate por nuestro stand para la entrega de premios.
          </p>
            <p className={styles.text}>
              Descubre nuestro enfoque en ciberseguridad <a href="https://www.betterask.erni/es-es/servicios/ciberseguridad/" target="_blank" rel="noopener noreferrer">aquí</a>.
            </p>
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="nickname" className={styles.label}>Nickname</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameError('');
                }}
                className={`${styles.input} ${nicknameError ? styles.inputError : ''}`}
                placeholder="Introduce tu Nickname"
                disabled={registering}
              />
              {nicknameError && <span className={styles.errorMessage} style={{ color: 'red' }}>{nicknameError}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                placeholder="Introduce tu correo electrónico"
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
                {registering ? <AnimatedDots text="[Registrando...]" /> : '[Registrarse]'}
              </button>
            </div>
            <p className={styles.terms}>
              Al enviar tus datos, aceptas nuestros <a href="https://www.betterask.erni/es-es/privacy-statement/" target="_blank" rel="noopener noreferrer">Términos y condiciones</a>.
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
              <AnimatedDots text="Cargando..." />
            </p>
          </div>
        </main>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
