'use client';

import styles from "../../components/page.module.css";
import { Button } from "../../components/Button";

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
  placeholder = "Write your prompt here...",
  visible,
  onAsk,
  disabled = false,
  loading = false,
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
        disabled={loading}
      />
      <div className={styles.buttonGroup}>
        <Button
          onClick={onAsk}
          disabled={value.trim() === '' || disabled}
          loading={loading}
          loadingText="[Asking...]"
        >
          [Ask]
        </Button>
      </div>
    </>
  );
};
