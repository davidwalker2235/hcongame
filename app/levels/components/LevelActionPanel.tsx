'use client';

import styles from "../../components/page.module.css";
import { AnimatedDots } from "../../components/AnimatedDots";

type LevelActionPanelProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  visible: boolean;
  onAsk: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export const LevelActionPanel = ({
  value,
  onChange,
  placeholder = "Escribe aquí tu pregunta.",
  visible,
  onAsk,
  disabled = false,
  loading = false,
}: LevelActionPanelProps) => {
  if (!visible) {
    return null;
  }

  const isButtonEnabled = value.trim() !== '' && !disabled && !loading;

  return (
    <>
      <textarea
        className={styles.textarea}
        placeholder={placeholder}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
      />
      <div className={styles.buttonGroup}>
        <button 
          type="button" 
          onClick={onAsk}
          className={`${styles.button} ${isButtonEnabled ? styles.buttonActive : styles.buttonDisabled}`}
          disabled={!isButtonEnabled}
        >
          {loading ? <AnimatedDots text="[Preguntando...]" /> : '[Preguntar]'}
        </button>
      </div>
    </>
  );
};
