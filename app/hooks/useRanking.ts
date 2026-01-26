'use client';

import { useState, useEffect } from 'react';
import { useFirebaseDatabase } from './useFirebaseDatabase';

export type RankingItem = {
  id: string;
  nickname?: string;
  email?: string;
  currentLevel?: number;
  score?: number;
  position?: number;
  [key: string]: any;
};

export const useRanking = (isVerified: boolean) => {
  const { read, loading } = useFirebaseDatabase();
  const [rankingData, setRankingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await read('ranking');
        setRankingData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching ranking:', err);
        setError('Error loading ranking data');
      }
    };

    if (isVerified) {
      fetchRanking();
    }
  }, [isVerified, read]);

  const rankingArray: RankingItem[] = rankingData ? Object.entries(rankingData)
    .map(([key, value]: [string, any]): RankingItem => ({
      id: key,
      ...value
    }))
    .sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      return 0;
    }) : [];

  return {
    rankingArray,
    loading,
    error,
    hasData: rankingArray.length > 0,
  };
};
