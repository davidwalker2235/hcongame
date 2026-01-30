'use client';

import { Suspense, useEffect, useState } from 'react';
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";
import { useFirebaseDatabase } from "../hooks/useFirebaseDatabase";

/** Formato: dd/mm, HH:MM (sin año ni segundos) */
const formatTimestamp = (value: string | number) => {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}, ${hh}:${min}`;
  } catch {
    return String(value);
  }
};

function RankingContent() {
  const { isVerified, loading: verificationLoading, id: sessionId, userData } = useUserVerification();
  const { read, loading: firebaseLoading } = useFirebaseDatabase();
  const [rankingData, setRankingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await read('leaderboard');
        setRankingData(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Error loading leaderboard data');
      }
    };

    if (isVerified) {
      fetchRanking();
    }
  }, [isVerified, read]);

  if (verificationLoading || firebaseLoading || isVerified === null || isVerified === false) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              Loading...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Convertir el objeto de ranking a un array ordenado
  const rankingArray = rankingData ? Object.entries(rankingData)
    .map(([key, value]: [string, any]) => ({
      id: key,
      ...value
    }))
    .sort((a, b) => {
      // Ordenar por posición si existe, sino por orden de llegada
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      return 0;
    }) : [];

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Leaderboard</h1>
          
          {error && (
            <div style={{ color: '#ff4444', marginBottom: '20px' }}>
              <p className={styles.text}>{error}</p>
            </div>
          )}

          {!rankingData && !error && (
            <p className={styles.text} style={{ textAlign: 'center' }}>
              No leaderboard data available
            </p>
          )}

          {rankingArray.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <ol style={{
                listStyle: 'none',
                counterReset: 'ranking-counter',
                padding: 0,
                margin: 0
              }}>
                {rankingArray.map((item, index) => {
                  const isActiveUser =
                    (sessionId != null && item.id === sessionId) ||
                    (userData?.nickname != null && item.nickname === userData.nickname);
                  return (
                  <li
                    key={item.id || index}
                    className={isActiveUser ? styles.rankingRowActive : undefined}
                    style={{
                      counterIncrement: 'ranking-counter',
                      marginBottom: '15px',
                      padding: '12px',
                      backgroundColor: isActiveUser ? 'rgba(0, 255, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: isActiveUser ? '1px solid rgba(0, 255, 0, 0.6)' : '1px solid rgba(0, 255, 0, 0.2)',
                      borderRadius: '5px',
                      position: 'relative',
                      paddingLeft: '40px',
                      ...(isActiveUser ? { boxShadow: '0 0 12px rgba(0, 255, 0, 0.5)' } : {})
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        color: isActiveUser ? '#b3ffb3' : '#00ff00',
                        fontWeight: 'bold',
                        fontFamily: 'Courier New, Courier, monospace'
                      }}
                    >
                      {index + 1}.
                    </span>
                    <div className={styles.rankingRow}>
                      <div className={styles.rankingLeft}>
                        {item.nickname && (
                          <span className={styles.rankingInline}>
                            {item.nickname}
                          </span>
                        )}
                        {item.position !== undefined && (
                          <span className={styles.rankingInline}>
                            <strong>Pos:</strong> {item.position}
                          </span>
                        )}
                        {item.highest_level !== undefined && (
                          <span className={`${styles.rankingInline} ${styles.rankingLevelMobile}`}>
                            <strong>Level:</strong> {item.highest_level}
                          </span>
                        )}
                      </div>
                      <div className={styles.rankingRight}>
                        {item.total_attempts !== undefined && (
                          <span className={styles.rankingInline}>
                            <strong>Attempts:</strong> {item.total_attempts}
                          </span>
                        )}
                        {item.completed_at && (
                          <span className={styles.rankingInline}>
                            <strong>Completed at:</strong> {formatTimestamp(item.completed_at)}
                          </span>
                        )}
                        {item.highest_level !== undefined && (
                          <span className={`${styles.rankingInline} ${styles.rankingLevelDesktop}`}>
                            <strong>Level:</strong> {item.highest_level}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Ranking() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: 'center' }}>
              Loading...
            </p>
          </div>
        </main>
      </div>
    }>
      <RankingContent />
    </Suspense>
  );
}
