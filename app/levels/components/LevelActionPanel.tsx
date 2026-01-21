'use client';

import styles from "../../components/page.module.css";

type LevelActionPanelProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  visible: boolean;
};

export const LevelActionPanel = ({
  value,
  onChange,
  placeholder = "Write your prompt here...",
  visible,
}: LevelActionPanelProps) => {
  if (!visible) {
    return null;
  }

  return (
    <>
      <textarea
        className={styles.textarea}
        placeholder={placeholder}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className={styles.buttonGroup}>
        <button type="button" className={`${styles.button} ${styles.buttonActive}`}>
          [Ask]
        </button>
      </div>
    </>
  );
};
