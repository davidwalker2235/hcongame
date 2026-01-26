'use client';

import { AnimatedDots } from './AnimatedDots';
import styles from './page.module.css';

type LoadingSpinnerProps = {
  message?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const LoadingSpinner = ({ 
  message = 'Loading...', 
  className,
  style 
}: LoadingSpinnerProps) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          <p className={className || styles.text} style={{ textAlign: 'center', ...style }}>
            <AnimatedDots text={message} />
          </p>
        </div>
      </main>
    </div>
  );
};
