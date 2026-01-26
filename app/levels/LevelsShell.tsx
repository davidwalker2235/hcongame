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

interface VerifyResponse {
  level: number;
  correct: boolean;
}

type LevelsShellProps = {
  levelTexts: Record<number, string>;
};

export const LevelsShell = ({ levelTexts }: LevelsShellProps) => {
  const { isVerified, userData, loading, id: sessionId } = useUserVerification();
  const { subscribe, updateData } = useFirebaseDatabase();
  const { executeGet, loading: apiLoading, error: apiError } = useApi<ChallengeResponse>();
  const { executePost: executePostAsk, loading: askLoading, error: askError } = useApi<AskResponse>();
  const { executePost: executePostVerify, loading: verifyLoading, error: verifyError } = useApi<VerifyResponse>();
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
  const [secretWord, setSecretWord] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  // Estado para el texto que se está animando (se congela cuando la animación comienza)
  const [animatingText, setAnimatingText] = useState<string>("");
  const animationInProgressRef = useRef<boolean>(false);
  // Ref para rastrear la key estable de la animación de respuesta
  const responseAnimationKeyRef = useRef<string>("");

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
    setSecretWord("");
    setIsCorrect(false);
    // Resetear animationDone cuando cambia el nivel para que la animación se ejecute de nuevo
    setAnimationDone(false);
    // Resetear texto de animación
    setAnimatingText("");
    animationInProgressRef.current = false;
    // Resetear key de animación de respuesta
    responseAnimationKeyRef.current = "";
  }, [selectedLevel, setAnimationDone]);

  // Hacer llamada GET cuando cambia el nivel seleccionado
  useEffect(() => {
    if (!isVerified) return;

    const fetchLevelData = async () => {
      setStoryLoading(true);
      setLevelStory("");
      setLevelHint("");
      setAnimatingText("");
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

  // Establecer animatingText cuando levelStory cambia y la animación no está en progreso
  useEffect(() => {
    // Solo establecer animatingText si:
    // 1. Tenemos levelStory
    // 2. La animación no ha terminado
    // 3. No está saltada
    // 4. La animación no está en progreso
    // 5. animatingText está vacío o es diferente (para evitar loops)
    if (levelStory && !animationDone && !skipAnimation && !animationInProgressRef.current && animatingText !== levelStory) {
      setAnimatingText(levelStory);
    }
  }, [levelStory, animationDone, skipAnimation, animatingText]);

  // Marcar que la animación está en progreso cuando shouldAnimate se vuelve true
  useEffect(() => {
    const textToDisplay = levelStory || levelTexts[selectedLevel] || "Loading level content...";
    const currentLevelText = animatingText || textToDisplay;
    const shouldAnimate = !storyLoading && !skipAnimation && !animationDone && currentLevelText && currentLevelText !== "Loading level content...";
    
    if (shouldAnimate && currentLevelText) {
      animationInProgressRef.current = true;
    }
  }, [storyLoading, skipAnimation, animationDone, animatingText, levelStory, selectedLevel, levelTexts]);

  // Manejar clicks/touches para interrumpir la animación
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleInteraction = (e: Event) => {
      // Solo interrumpir si el click no es en un input, textarea o botón
      const target = e.target as HTMLElement;
      const isInteractiveElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'BUTTON' ||
        target.closest('button') !== null ||
        target.closest('input') !== null ||
        target.closest('textarea') !== null;
      
      if (isInteractiveElement) {
        return;
      }

      // Solo interrumpir si la animación está en progreso y no ha sido saltada ya
      if (!animationDone && !skipAnimation) {
        e.preventDefault();
        e.stopPropagation();
        setSkipAnimation(true);
        setAnimationDone(true);
      }
      if (!responseAnimationDone && !skipResponseAnimation && apiResponse) {
        e.preventDefault();
        e.stopPropagation();
        setSkipResponseAnimation(true);
        setResponseAnimationDone(true);
      }
    };

    // Añadir listeners para click y touch
    container.addEventListener('click', handleInteraction, { capture: true });
    container.addEventListener('touchstart', handleInteraction, { passive: true, capture: true });

    return () => {
      container.removeEventListener('click', handleInteraction, { capture: true } as any);
      container.removeEventListener('touchstart', handleInteraction, { capture: true } as any);
    };
  }, [animationDone, skipAnimation, setAnimationDone, responseAnimationDone, skipResponseAnimation, apiResponse]);

  // Función para manejar el envío del prompt
  const handleAsk = async () => {
    if (!levelNote.trim() || responseLoading) return;

    setResponseLoading(true);
    setApiResponse("");
    setResponseAnimationDone(false);
    setSkipResponseAnimation(false);
    setSecretWord("");
    // Generar una key estable para la animación de respuesta
    responseAnimationKeyRef.current = `response-${selectedLevel}-${Date.now()}`;

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

  // Función para manejar la verificación del secret
  const handleCheck = async () => {
    if (!secretWord.trim() || verifyLoading || !sessionId) return;

    try {
      const response = await executePostVerify(
        `/challenge/${selectedLevel}/verify`,
        { secret: secretWord.trim() }
      );
      
      // Si la respuesta es correcta, actualizar el currentLevel en Firebase y mostrar mensaje
      if (response?.correct === true && response?.level) {
        const currentLevel = response.level;
        // Calcular el nuevo nivel (level + 1, pero máximo 10)
        const newLevel = Math.min(currentLevel + 1, 10);
        
        // Actualizar Firebase
        await updateData(`users/${sessionId}`, {
          currentLevel: newLevel
        });
        
        // Marcar como correcto para mostrar el mensaje de felicitación
        setIsCorrect(true);
      }
    } catch (error) {
      console.error('Error verifying secret:', error);
      // El error ya está manejado por useApi
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
  const textToDisplay = levelStory || "Loading level content...";
  
  // Usar el texto de animación si está disponible, sino usar el texto a mostrar
  // Esto asegura que el texto no cambie durante la animación
  const currentLevelText = animatingText || textToDisplay;

  // Determinar si debemos mostrar la animación
  // Solo animar si tenemos texto, no estamos cargando, no está saltado, y la animación no ha terminado
  const shouldAnimate = !storyLoading && !skipAnimation && !animationDone && currentLevelText && currentLevelText !== "Loading level content...";

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

            {storyLoading && !textToDisplay ? (
              <p className={styles.levelDescription} style={{ textAlign: 'center' }}>
                Loading...
              </p>
            ) : skipAnimation ? (
              <p className={styles.levelDescription}>
                {processText(textToDisplay)}
              </p>
            ) : shouldAnimate ? (
              <TypeAnimation
                key={`level-description-${selectedLevel}`}
                sequence={[
                  currentLevelText,
                  1000,
                  () => {
                    setAnimationDone(true);
                    animationInProgressRef.current = false;
                  },
                ]}
                speed={40}
                wrapper="p"
                cursor={true}
                repeat={0}
                className={styles.levelDescription}
                preRenderFirstString={false}
              />
            ) : (
              <p className={styles.levelDescription}>
                {processText(textToDisplay)}
              </p>
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
                    key={responseAnimationKeyRef.current || `response-${selectedLevel}`}
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

            {/* Input y botón Check - solo visible cuando la respuesta ha terminado */}
            {(responseAnimationDone || skipResponseAnimation) && apiResponse && (
              <div style={{ marginTop: '20px' }}>
                {isCorrect ? (
                  <p className={styles.text} style={{ 
                    color: '#00ff00', 
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginTop: '20px',
                    textShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
                  }}>
                    Congratulations, Sir {userData?.nickname || 'User'}. Proceed to the next level.
                  </p>
                ) : (
                  <>
                    <input
                      type="text"
                      value={secretWord}
                      onChange={(e) => setSecretWord(e.target.value)}
                      placeholder="Write the secret word"
                      className={styles.input}
                      disabled={verifyLoading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && secretWord.trim() && !verifyLoading) {
                          handleCheck();
                        }
                      }}
                    />
                    <div className={styles.buttonGroup} style={{ marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={handleCheck}
                        className={`${styles.button} ${
                          secretWord.trim() && !verifyLoading
                            ? styles.buttonActive
                            : styles.buttonDisabled
                        }`}
                        disabled={!secretWord.trim() || verifyLoading}
                      >
                        {verifyLoading ? '[Checking...]' : '[Check]'}
                      </button>
                    </div>
                    
                    {verifyError && (
                      <div style={{ color: '#ff4444', marginTop: '10px' }}>
                        <p className={styles.text}>
                          <strong>Error:</strong> {verifyError.message}
                        </p>
                        {verifyError.detail && verifyError.detail.length > 0 && (
                          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                            {verifyError.detail.map((detail, index) => (
                              <li key={index} className={styles.text}>
                                {detail.msg}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

