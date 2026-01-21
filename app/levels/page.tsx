'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import styles from "../components/page.module.css";
import { useFirebaseDatabase } from "../hooks/useFirebaseDatabase";
import { useUserVerification } from "../hooks/useUserVerification";
import { LEVEL_TEXTS } from "../data/levelTexts";
import { TypeAnimation } from "react-type-animation";

const LEVEL_COUNT = 7;
const clampLevel = (value: number) => Math.min(Math.max(Math.floor(value), 1), LEVEL_COUNT);

function LevelsContent() {
  const { isVerified, loading, userData, id: sessionId } = useUserVerification();
  const { subscribe } = useFirebaseDatabase();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [liveUserData, setLiveUserData] = useState<any>(userData ?? null);
  const didSetInitialLevelRef = useRef(false);

  const currentLevelFromData = useMemo(() => {
    if (!liveUserData?.currentLevel) return 1;
    return clampLevel(Number(liveUserData.currentLevel));
  }, [liveUserData]);

  const [levelNote, setLevelNote] = useState('');
  const [animationDone, setAnimationDone] = useState(false);
  useEffect(() => {
    setLevelNote('');
    setAnimationDone(false);
  }, [selectedLevel]);

  useEffect(() => {
    setLiveUserData(userData ?? null);
  }, [userData]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const unsubscribe = subscribe(`users/${sessionId}`, (data) => {
      setLiveUserData(data ?? null);
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, subscribe]);

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

  if (loading || isVerified === null || isVerified === false) {
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

  const levelTabs = Array.from({ length: LEVEL_COUNT }, (_, index) => index + 1);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.levelsSection}>
          <div className={styles.levelTabs}>
            {levelTabs.map((level) => {
              const isAccessible = level <= currentLevelFromData;
              const isActive = level === selectedLevel;

              return (
                <button
                  key={`level-tab-${level}`}
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => {
                    if (!isAccessible) return;
                    setSelectedLevel(level);
                  }}
                  className={[
                    styles.levelTab,
                    isAccessible ? styles.levelTabAccessible : styles.levelTabLocked,
                    isActive ? styles.levelTabActive : ""
                  ].join(" ").trim()}
                >
                  Level {level}
                </button>
              );
            })}
          </div>

          <div className={styles.levelContent}>
            <h2 className={styles.levelTitle}>Level {selectedLevel}</h2>
            <TypeAnimation
              key={`level-description-${selectedLevel}`}
              sequence={[
                LEVEL_TEXTS[selectedLevel] ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                1000,
                () => setAnimationDone(true)
              ]}
              speed={40}
              wrapper="p"
              cursor={true}
              repeat={0}
              className={styles.levelDescription}
            />
            {animationDone && (
              <>
                <textarea
                  className={styles.textarea}
                  placeholder="Write your prompt here..."
                  rows={2}
                  value={levelNote}
                  onChange={(event) => setLevelNote(event.target.value)}
                />
                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonActive}`}
                  >
                    [Ask]
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Levels() {
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
      <LevelsContent />
    </Suspense>
  );
}
