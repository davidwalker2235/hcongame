'use client';

import styles from './page.module.css';

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  detail?: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

type ErrorDisplayProps = {
  error: ApiError;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const ErrorDisplay = ({ 
  error, 
  title = 'Error',
  className,
  style 
}: ErrorDisplayProps) => {
  return (
    <div style={{ color: '#ff4444', marginBottom: '20px', ...style }} className={className}>
      <p className={styles.text}>
        <strong>{title}:</strong> {error.message}
      </p>
      {error.detail && error.detail.length > 0 && (
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          {error.detail.map((detail, index) => (
            <li key={index} className={styles.text}>
              {detail.msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
