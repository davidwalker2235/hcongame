'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../components/page.module.css";
import { useFirebaseDatabase } from "../hooks/useFirebaseDatabase";
import { useUserVerification } from "../hooks/useUserVerification";
import { TypeAnimation } from "react-type-animation";
import { LevelTabs } from "./components/LevelTabs";
import { LevelActionPanel } from "./components/LevelActionPanel";
import { useLevelNote } from "./hooks/useLevelNote";
import { useApi } from "../hooks/useApi";
import { processText } from "./utils/textProcessor";

const LEVEL_COUNT = 10;
const clampLevel = (value: number) => Math.min(Math.max(Math.floor(value), 1), LEVEL_COUNT);

interface ChallengeResponse {
  level: number;
  difficulty: string;
  story: string;
  hint: string;
}

interface AskResponse {
  level: number;
  response: string;
}

type LevelsShellProps = {
  levelTexts: Record<number, string>;
};

export const LevelsShell = ({ levelTexts }: LevelsShellProps) => {
  const { isVerified, userData, loading, id: sessionId } = useUserVerification();
  const { subscribe } = useFirebaseDatabase();
  const { executeGet, loading: apiLoading, error: apiError } = useApi<ChallengeResponse>();
  const { executePost: executePostAsk, loading: askLoading, error: askError } = useApi<AskResponse>();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [liveUserData, setLiveUserData] = useState<any>(userData ?? null);
  const didSetInitialLevelRef = useRef(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [levelStory, setLevelStory] = useState<string>("");
  const [levelHint, setLevelHint] = useState<string>("");
  const [storyLoading, setStoryLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<string>("");
  const [responseLoading, setResponseLoading] = useState<boolean>(false);
  const [responseAnimationDone, setResponseAnimationDone] = useState<boolean>(false);
  const [skipResponseAnimation, setSkipResponseAnimation] = useState<boolean>(false);

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
    setApiResponse("");
    setResponseAnimationDone(false);
    setSkipResponseAnimation(false);
  }, [selectedLevel]);

  // Hacer llamada GET cuando cambia el nivel seleccionado
  useEffect(() => {
    if (!isVerified) return;

    const fetchLevelData = async () => {
      setStoryLoading(true);
      setLevelStory("");
      setLevelHint("");
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
        // El error ya está manejado por useApi
      } finally {
        setStoryLoading(false);
      }
    };

    fetchLevelData();
  }, [selectedLevel, isVerified, executeGet]);

  // Manejar clicks/touches para interrumpir la animación
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleInteraction = () => {
      if (!animationDone && !skipAnimation) {
        setSkipAnimation(true);
        setAnimationDone(true);
      }
      if (!responseAnimationDone && !skipResponseAnimation && apiResponse) {
        setSkipResponseAnimation(true);
        setResponseAnimationDone(true);
      }
    };

    // Añadir listeners para click y touch
    container.addEventListener('click', handleInteraction);
    container.addEventListener('touchstart', handleInteraction, { passive: true });

    return () => {
      container.removeEventListener('click', handleInteraction);
      container.removeEventListener('touchstart', handleInteraction);
    };
  }, [animationDone, skipAnimation, setAnimationDone, responseAnimationDone, skipResponseAnimation, apiResponse]);

  // Función para manejar el envío del prompt
  const handleAsk = async () => {
    if (!levelNote.trim() || responseLoading) return;

    setResponseLoading(true);
    setApiResponse("");
    setResponseAnimationDone(false);
    setSkipResponseAnimation(false);

    try {
      const response = await executePostAsk(
        `/challenge/${selectedLevel}`,
        { prompt: levelNote.trim() }
      );
      
      if (response?.response) {
        setApiResponse(response.response);
      }
    } catch (error) {
      console.error('Error sending prompt:', error);
      // El error ya está manejado por useApi
    } finally {
      setResponseLoading(false);
    }
  };

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

  // Usar el story de la API si está disponible, sino usar el texto por defecto
  const currentLevelText = levelStory || levelTexts[selectedLevel] || "Loading level content...";

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
              <div style={{ color: '#ff4444', marginBottom: '20px' }}>
                <p className={styles.text}>
                  <strong>Error loading level:</strong> {apiError.message}
                </p>
                {apiError.detail && apiError.detail.length > 0 && (
                  <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    {apiError.detail.map((detail, index) => (
                      <li key={index} className={styles.text}>
                        {detail.msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {storyLoading && !levelStory ? (
              <p className={styles.levelDescription} style={{ textAlign: 'center' }}>
                Loading...
              </p>
            ) : (animationDone || skipAnimation) ? (
              <p className={styles.levelDescription}>
                {processText(currentLevelText)}
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
              placeholder={levelHint || undefined}
              visible={(animationDone || skipAnimation) && !storyLoading}
              onAsk={handleAsk}
              disabled={askLoading}
              loading={askLoading || responseLoading}
            />
            
            {askError && (
              <div style={{ color: '#ff4444', marginTop: '20px' }}>
                <p className={styles.text}>
                  <strong>Error:</strong> {askError.message}
                </p>
                {askError.detail && askError.detail.length > 0 && (
                  <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    {askError.detail.map((detail, index) => (
                      <li key={index} className={styles.text}>
                        {detail.msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {apiResponse && (
              <div style={{ marginTop: '20px' }}>
                {skipResponseAnimation ? (
                  <p className={styles.levelDescription}>
                    {processText(apiResponse)}
                  </p>
                ) : (
                  <TypeAnimation
                    key={`response-${selectedLevel}-${Date.now()}`}
                    sequence={[
                      apiResponse,
                      1000,
                      () => setResponseAnimationDone(true),
                    ]}
                    speed={40}
                    wrapper="p"
                    cursor={true}
                    repeat={0}
                    className={styles.levelDescription}
                  />
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

