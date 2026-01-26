'use client';

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import styles from "./components/page.module.css";
import { Logo } from "./components/Logo";
import { useFirebaseDatabase } from "./hooks/useFirebaseDatabase";
import { useSessionId } from "./hooks/useSessionId";
import { useUserVerification } from "./hooks/useUserVerification";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { FormInput } from "./components/FormInput";
import { Button } from "./components/Button";
import { useForm } from "./hooks/useForm";
import { useEmailValidation } from "./hooks/useEmailValidation";

function HomeContent() {
  const router = useRouter();
  const { sessionId, isInitialized } = useSessionId();
  const { updateData, loading } = useFirebaseDatabase();
  const { isVerified, userData } = useUserVerification();
  const { error: emailError, handleEmailChange: handleEmailChangeWrapper, setError: setEmailError } = useEmailValidation();

  const { values, setValue, isSubmitting, handleSubmit } = useForm({
    initialValues: {
      nickname: '',
      email: '',
    },
    validationRules: {
      nickname: (value) => (value.trim() === '' ? 'Nickname is required' : null),
      email: (value) => {
        if (value.trim() === '') return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Invalid email format' : null;
      },
    },
    onSubmit: async (formValues) => {
      if (!sessionId) return;
      await updateData(`users/${sessionId}`, {
        nickname: formValues.nickname.trim(),
        email: formValues.email.trim(),
      });
      router.push('/levels');
    },
  });

  // Cargar datos existentes si el usuario ya tiene algunos datos pero faltan email/nickname
  useEffect(() => {
    if (userData && sessionId) {
      if (userData.nickname && typeof userData.nickname === 'string' && userData.nickname.trim() !== '') {
        setValue('nickname', userData.nickname);
      }
      if (userData.email && typeof userData.email === 'string' && userData.email.trim() !== '') {
        setValue('email', userData.email);
      }
    }
  }, [userData, sessionId, setValue]);

  // Verificar si el usuario ya tiene email y nickname completos
  useEffect(() => {
    if (!isInitialized) return;
    if (!sessionId) {
      router.push('/wrong-access');
      return;
    }
    if (isVerified === true) {
      router.push('/levels');
    }
  }, [sessionId, isInitialized, isVerified, router]);

  // Mostrar loading mientras se verifica el usuario
  if (loading || !isInitialized || isVerified === null) {
    return <LoadingSpinner />;
  }

  // Si el usuario está verificado (tiene email y nickname), no deberíamos llegar aquí (se redirige)
  if (isVerified === true || !sessionId) {
    return null;
  }

  const isFormValid = values.nickname.trim() !== '' && values.email.trim() !== '' && !emailError;

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
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <FormInput
              id="nickname"
              label="Nickname"
              value={values.nickname}
              onChange={(value) => setValue('nickname', value)}
              placeholder="Enter your nickname"
              disabled={isSubmitting}
              required
            />

            <FormInput
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={(value) => handleEmailChangeWrapper(value, setValue.bind(null, 'email'))}
              placeholder="Enter your email"
              error={emailError}
              disabled={isSubmitting}
              required
            />

            <div className={styles.buttonGroup}>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid}
                loading={isSubmitting}
                loadingText="[Registering...]"
              >
                [Register]
              </Button>
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
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}
