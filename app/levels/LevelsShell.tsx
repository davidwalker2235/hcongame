'use client';

import { useEffect, useRef, useState } from "react";
import styles from "../components/page.module.css";
import { useUserVerification } from "../hooks/useUserVerification";
import { LevelTabs } from "./components/LevelTabs";
import { LevelActionPanel } from "./components/LevelActionPanel";
import { useLevelNote } from "./hooks/useLevelNote";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorDisplay } from "../components/ErrorDisplay";
import { LevelStory } from "./components/LevelStory";
import { LevelResponse } from "./components/LevelResponse";
import { SecretWordInput } from "./components/SecretWordInput";
import { useLevelData } from "./hooks/useLevelData";
import { useLevelAnimation } from "./hooks/useLevelAnimation";
import { useLevelInteractions } from "./hooks/useLevelInteractions";
import { useLevelApi } from "./hooks/useLevelApi";
import { useLevelState } from "./hooks/useLevelState";

type LevelsShellProps = {
  levelTexts: Record<number, string>;
};

export const LevelsShell = ({ levelTexts }: LevelsShellProps) => {
  const { isVerified, userData, loading, id: sessionId } = useUserVerification();
  const containerRef = useRef<HTMLDivElement>(null);
  const [secretWord, setSecretWord] = useState<string>("");

  // Hooks personalizados
  const { selectedLevel, setSelectedLevel, currentLevelFromData, LEVEL_COUNT } = useLevelState(userData, !!isVerified, loading);
  const { levelStory, levelHint, loading: storyLoading, error: apiError } = useLevelData(selectedLevel, !!isVerified);
  const { levelNote, setLevelNote, animationDone, setAnimationDone } = useLevelNote(selectedLevel);
  const {
    skipAnimation,
    setSkipAnimation,
    animationDone: storyAnimationDone,
    setAnimationDone: setStoryAnimationDone,
    animatingText,
    animationInProgressRef,
  } = useLevelAnimation(selectedLevel, levelStory);

  const {
    apiResponse,
    responseLoading,
    responseAnimationDone,
    setResponseAnimationDone,
    skipResponseAnimation,
    setSkipResponseAnimation,
    isCorrect,
    askLoading,
    askError,
    verifyLoading,
    verifyError,
    handleAsk,
    handleCheck,
    reset: resetApi,
    responseAnimationKey,
  } = useLevelApi(selectedLevel, sessionId);

  // Resetear estados cuando cambia el nivel
  useEffect(() => {
    setSkipAnimation(false);
    setSecretWord("");
    setAnimationDone(false);
    setStoryAnimationDone(false);
    resetApi();
  }, [selectedLevel, setAnimationDone, setStoryAnimationDone, resetApi]);

  // Manejar interacciones para saltar animaciones
  useLevelInteractions({
    containerRef,
    animationDone: storyAnimationDone,
    skipAnimation,
    setSkipAnimation,
    setAnimationDone: setStoryAnimationDone,
    responseAnimationDone,
    skipResponseAnimation,
    setSkipResponseAnimation,
    setResponseAnimationDone,
    apiResponse,
  });

  const handleAskClick = () => {
    handleAsk(levelNote);
  };

  const handleCheckClick = () => {
    handleCheck(secretWord);
  };

  if (loading || isVerified === null || isVerified === false) {
    return <LoadingSpinner />;
  }

  const textToDisplay = levelStory || "Loading level content...";
  const currentLevelText = animatingText || textToDisplay;
  const shouldAnimate = Boolean(!storyLoading && !skipAnimation && !storyAnimationDone && currentLevelText && currentLevelText !== "Loading level content...");

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
            
            {apiError && (
              <ErrorDisplay error={apiError} title="Error loading level" style={{ marginBottom: '20px' }} />
            )}

            <LevelStory
              text={currentLevelText}
              isLoading={!!storyLoading}
              shouldAnimate={!!shouldAnimate}
              skipAnimation={!!skipAnimation}
              animationDone={!!storyAnimationDone}
              onAnimationComplete={() => {
                setStoryAnimationDone(true);
                animationInProgressRef.current = false;
              }}
              selectedLevel={selectedLevel}
            />

            <LevelActionPanel
              value={levelNote}
              onChange={setLevelNote}
              placeholder={levelHint || undefined}
              visible={(storyAnimationDone || skipAnimation) && !storyLoading}
              onAsk={handleAskClick}
              disabled={askLoading}
              loading={askLoading || responseLoading}
            />
            
            {askError && (
              <ErrorDisplay error={askError} title="Error" style={{ marginTop: '20px' }} />
            )}
            
            <LevelResponse
              response={apiResponse}
              skipAnimation={skipResponseAnimation}
              animationDone={responseAnimationDone}
              onAnimationComplete={() => setResponseAnimationDone(true)}
              selectedLevel={selectedLevel}
              animationKey={responseAnimationKey}
            />

            {(responseAnimationDone || skipResponseAnimation) && apiResponse && (
              <SecretWordInput
                value={secretWord}
                onChange={setSecretWord}
                onCheck={handleCheckClick}
                loading={verifyLoading}
                error={verifyError}
                isCorrect={isCorrect}
                userNickname={userData?.nickname}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
