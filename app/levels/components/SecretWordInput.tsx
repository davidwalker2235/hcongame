'use client';

import { Button } from '../../components/Button';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import styles from '../../components/page.module.css';

type SecretWordInputProps = {
  value: string;
  onChange: (value: string) => void;
  onCheck: () => void;
  loading: boolean;
  error?: any;
  isCorrect: boolean;
  userNickname?: string;
};

export const SecretWordInput = ({
  value,
  onChange,
  onCheck,
  loading,
  error,
  isCorrect,
  userNickname = 'User',
}: SecretWordInputProps) => {
  if (isCorrect) {
    return (
      <p className={styles.text} style={{ 
        color: '#00ff00', 
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: '20px',
        textShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
      }}>
        Congratulations, Sir {userNickname}. Proceed to the next level.
      </p>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write the secret word"
        className={styles.input}
        disabled={loading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim() && !loading) {
            onCheck();
          }
        }}
      />
      <div className={styles.buttonGroup} style={{ marginTop: '10px' }}>
        <Button
          onClick={onCheck}
          disabled={!value.trim() || loading}
          loading={loading}
          loadingText="[Checking...]"
        >
          [Check]
        </Button>
      </div>
      
      {error && <ErrorDisplay error={error} title="Error" style={{ marginTop: '10px' }} />}
    </div>
  );
};
