'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../components/page.module.css";
import { useFirebaseDatabase } from "../hooks/useFirebaseDatabase";
import { useUserVerification } from "../hooks/useUserVerification";
import { TypeAnimation } from "react-type-animation";
import { LevelTabs } from "./components/LevelTabs";
import { LevelActionPanel } from "./components/LevelActionPanel";
import { useLevelNote } from "./hooks/useLevelNote";

const LEVEL_COUNT = 7;
const clampLevel = (value: number) => Math.min(Math.max(Math.floor(value), 1), LEVEL_COUNT);

type LevelsShellProps = {
  levelTexts: Record<number, string>;
};

export const LevelsShell = ({ levelTexts }: LevelsShellProps) => {
  const { isVerified, userData, loading, id: sessionId } = useUserVerification();
  const { subscribe } = useFirebaseDatabase();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [liveUserData, setLiveUserData] = useState<any>(userData ?? null);
  const didSetInitialLevelRef = useRef(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { levelNote, setLevelNote, animationDone, setAnimationDone } = useLevelNote(selectedLevel);

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

  // Resetear skipAnimation cuando cambia el nivel
  useEffect(() => {
    setSkipAnimation(false);
  }, [selectedLevel]);

  // Manejar clicks/touches para interrumpir la animación
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleInteraction = () => {
      if (!animationDone && !skipAnimation) {
        setSkipAnimation(true);
        setAnimationDone(true);
      }
    };

    // Añadir listeners para click y touch
    container.addEventListener('click', handleInteraction);
    container.addEventListener('touchstart', handleInteraction, { passive: true });

    return () => {
      container.removeEventListener('click', handleInteraction);
      container.removeEventListener('touchstart', handleInteraction);
    };
  }, [animationDone, skipAnimation, setAnimationDone]);

  if (loading || isVerified === null || isVerified === false) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <p className={styles.text} style={{ textAlign: "center" }}>
              Loading...
            </p>
          </div>
        </main>
      </div>
    );
  }

  const currentLevelText = levelTexts[selectedLevel] ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

  return (
    <div className={styles.container} ref={containerRef}>
      <main className={styles.main}>
        <div className={styles.content}>
          <LevelTabs
            levelCount={LEVEL_COUNT}
            currentLevel={currentLevelFromData}
            selectedLevel={selectedLevel}
            onSelect={setSelectedLevel}
          />

          <section className={styles.levelContent}>
            <h2 className={styles.levelTitle}>Level {selectedLevel}</h2>
            {skipAnimation ? (
              <p className={styles.levelDescription}>
                {currentLevelText}
              </p>
            ) : (
              <TypeAnimation
                key={`level-description-${selectedLevel}`}
                sequence={[
                  currentLevelText,
                  1000,
                  () => setAnimationDone(true),
                ]}
                speed={40}
                wrapper="p"
                cursor={true}
                repeat={0}
                className={styles.levelDescription}
              />
            )}
            <LevelActionPanel
              value={levelNote}
              onChange={setLevelNote}
              visible={animationDone || skipAnimation}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

