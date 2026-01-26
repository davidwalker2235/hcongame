'use client';

import styles from '../../components/page.module.css';

type RankingItemProps = {
  position: number;
  item: {
    id: string;
    nickname?: string;
    email?: string;
    currentLevel?: number;
    score?: number;
    [key: string]: any;
  };
};

export const RankingItem = ({ position, item }: RankingItemProps) => {
  return (
    <li
      style={{
        counterIncrement: 'ranking-counter',
        marginBottom: '15px',
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(0, 255, 0, 0.2)',
        borderRadius: '5px',
        position: 'relative',
        paddingLeft: '40px'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '12px',
          color: '#00ff00',
          fontWeight: 'bold',
          fontFamily: 'Courier New, Courier, monospace'
        }}
      >
        {position}.
      </span>
      <div style={{ color: '#d0ffd0' }}>
        {item.nickname && (
          <p className={styles.text} style={{ marginBottom: '5px', marginLeft: 0 }}>
            {item.nickname}
          </p>
        )}
        {item.email && (
          <p className={styles.text} style={{ marginBottom: '5px', marginLeft: 0 }}>
            <strong style={{ color: '#00ff00' }}>Email:</strong> {item.email}
          </p>
        )}
        {item.currentLevel !== undefined && (
          <p className={styles.text} style={{ marginBottom: '5px', marginLeft: 0 }}>
            <strong style={{ color: '#00ff00' }}>Level:</strong> {item.currentLevel}
          </p>
        )}
        {item.score !== undefined && (
          <p className={styles.text} style={{ marginBottom: '5px', marginLeft: 0 }}>
            <strong style={{ color: '#00ff00' }}>Score:</strong> {item.score}
          </p>
        )}
        {Object.entries(item)
          .filter(([key]) => !['id', 'nickname', 'email', 'currentLevel', 'score'].includes(key))
          .map(([key, value]) => (
            <p key={key} className={styles.text} style={{ marginBottom: '5px', marginLeft: 0 }}>
              <strong style={{ color: '#00ff00' }}>{key}:</strong> {String(value)}
            </p>
          ))}
      </div>
    </li>
  );
};
