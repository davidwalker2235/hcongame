'use client';

import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';

interface ChallengeResponse {
  level: number;
  difficulty: string;
  story: string;
  hint: string;
}

export const useLevelData = (selectedLevel: number, isVerified: boolean) => {
  const { executeGet, loading, error } = useApi<ChallengeResponse>();
  const [levelStory, setLevelStory] = useState<string>('');
  const [levelHint, setLevelHint] = useState<string>('');

  useEffect(() => {
    if (!isVerified) return;

    const fetchLevelData = async () => {
      setLevelStory('');
      setLevelHint('');
      try {
        const response = await executeGet(`/challenge/${selectedLevel}`);
        if (response?.story) {
          setLevelStory(response.story);
        }
        if (response?.hint) {
          setLevelHint(response.hint);
        }
      } catch (error) {
        console.error('Error fetching level data:', error);
      }
    };

    fetchLevelData();
  }, [selectedLevel, isVerified, executeGet]);

  return {
    levelStory,
    levelHint,
    loading,
    error,
  };
};
