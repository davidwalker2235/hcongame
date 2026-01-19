'use client';

import { useState } from "react";
import styles from "./components/page.module.css";
import { Logo } from "./components/Logo";

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

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

  const isFormValid = nickname.trim() !== '' && email.trim() !== '' && !emailError;

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
              />
              {emailError && <span className={styles.errorMessage}>{emailError}</span>}
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.button} ${isFormValid ? styles.buttonActive : styles.buttonDisabled}`}
                disabled={!isFormValid}
              >
                [Register]
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
