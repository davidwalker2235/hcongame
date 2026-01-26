'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useFirebaseDatabase } from '../../hooks/useFirebaseDatabase';

const LEVEL_COUNT = 10;
const clampLevel = (value: number) => Math.min(Math.max(Math.floor(value), 1), LEVEL_COUNT);

export const useLevelState = (userData: any, isVerified: boolean, loading: boolean) => {
  const { subscribe } = useFirebaseDatabase();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [liveUserData, setLiveUserData] = useState<any>(userData ?? null);
  const didSetInitialLevelRef = useRef(false);
  const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('user_session_id') : null;

  const currentLevelFromData = useMemo(() => {
    if (!liveUserData?.currentLevel) return 1;
    return clampLevel(Number(liveUserData.currentLevel));
  }, [liveUserData]);

  useEffect(() => void setLiveUserData(userData ?? null), [userData]);

  useEffect(() => {
    if (!isVerified || loading || didSetInitialLevelRef.current) return;
    setSelectedLevel(currentLevelFromData);
    didSetInitialLevelRef.current = true;
  }, [currentLevelFromData, isVerified, loading]);

  useEffect(() => {
    if (!didSetInitialLevelRef.current) return;
    if (currentLevelFromData < selectedLevel) {
      setSelectedLevel(currentLevelFromData);
    }
  }, [currentLevelFromData, selectedLevel]);

  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = subscribe(`users/${sessionId}`, (data) => setLiveUserData(data ?? null));
    return () => unsubscribe();
  }, [sessionId, subscribe]);

  return {
    selectedLevel,
    setSelectedLevel,
    currentLevelFromData,
    LEVEL_COUNT,
  };
};
