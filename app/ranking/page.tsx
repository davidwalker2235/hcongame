'use client';

import { Suspense } from 'react';
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProtectedPage } from "../components/ProtectedPage";
import { useRanking } from "@/app/hooks/useRanking";
import { RankingItem } from "./components/RankingItem";

// Tipo local para evitar problemas de importación
type RankingItemType = {
  id: string;
  nickname?: string;
  email?: string;
  currentLevel?: number;
  score?: number;
  position?: number;
  [key: string]: any;
};

function RankingContent() {
  const { isVerified } = useUserVerification();
  const { rankingArray, loading, error, hasData } = useRanking(!!isVerified);

  if (loading) {
    return <LoadingSpinner />;
  }

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

          {!hasData && !error && (
            <p className={styles.text} style={{ textAlign: 'center' }}>
              No ranking data available
            </p>
          )}

          {hasData && (
            <div style={{ marginTop: '20px' }}>
              <ol style={{ 
                listStyle: 'none', 
                counterReset: 'ranking-counter',
                padding: 0,
                margin: 0
              }}>
                {rankingArray.map((item: RankingItemType, index: number) => (
                  <RankingItem
                    key={item.id || index}
                    position={index + 1}
                    item={item}
                  />
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
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedPage>
        <RankingContent />
      </ProtectedPage>
    </Suspense>
  );
}
