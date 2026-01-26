'use client';

import { Suspense, useEffect, useState } from 'react';
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";
import { useFirebaseDatabase } from "../hooks/useFirebaseDatabase";

function RankingContent() {
  const { isVerified, loading: verificationLoading } = useUserVerification();
  const { read, loading: firebaseLoading } = useFirebaseDatabase();
  const [rankingData, setRankingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await read('ranking');
        setRankingData(data);
      } catch (err) {
        console.error('Error fetching ranking:', err);
        setError('Error loading ranking data');
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
          <h1 className={styles.title}>Ranking</h1>
          
          {error && (
            <div style={{ color: '#ff4444', marginBottom: '20px' }}>
              <p className={styles.text}>{error}</p>
            </div>
          )}

          {!rankingData && !error && (
            <p className={styles.text} style={{ textAlign: 'center' }}>
              No ranking data available
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
                {rankingArray.map((item, index) => (
                  <li
                    key={item.id || index}
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
                      {index + 1}.
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
                      {/* Mostrar cualquier otro campo que pueda existir */}
                      {Object.entries(item)
                        .filter(([key]) => !['id', 'nickname', 'email', 'currentLevel', 'score'].includes(key))
                        .map(([key, value]) => (
                          <p key={key} className={styles.text} style={{ marginBottom: '5px', marginLeft: 0 }}>
                            <strong style={{ color: '#00ff00' }}>{key}:</strong> {String(value)}
                          </p>
                        ))}
                    </div>
                  </li>
                ))}
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
