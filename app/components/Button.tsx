'use client';

import { AnimatedDots } from './AnimatedDots';
import styles from './page.module.css';

type ButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

export const Button = ({
  onClick,
  disabled = false,
  loading = false,
  loadingText,
  children,
  className,
  type = 'button',
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const buttonClass = `${styles.button} ${
    !isDisabled ? styles.buttonActive : styles.buttonDisabled
  } ${className || ''}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClass}
      disabled={isDisabled}
    >
      {loading && loadingText ? (
        <AnimatedDots text={loadingText} />
      ) : (
        children
      )}
    </button>
  );
};
