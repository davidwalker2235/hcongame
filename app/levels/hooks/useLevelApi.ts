'use client';

import { useState, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { useFirebaseDatabase } from '../../hooks/useFirebaseDatabase';

interface AskResponse {
  level: number;
  response: string;
}

interface VerifyResponse {
  level: number;
  correct: boolean;
}

export const useLevelApi = (selectedLevel: number, sessionId: string | null) => {
  const { executePost: executePostAsk, loading: askLoading, error: askError } = useApi<AskResponse>();
  const { executePost: executePostVerify, loading: verifyLoading, error: verifyError } = useApi<VerifyResponse>();
  const { updateData } = useFirebaseDatabase();
  
  const [apiResponse, setApiResponse] = useState<string>('');
  const [responseLoading, setResponseLoading] = useState<boolean>(false);
  const [responseAnimationDone, setResponseAnimationDone] = useState<boolean>(false);
  const [skipResponseAnimation, setSkipResponseAnimation] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const responseAnimationKeyRef = useRef<string>('');

  const handleAsk = async (prompt: string) => {
    if (!prompt.trim() || responseLoading) return;

    setResponseLoading(true);
    setApiResponse('');
    setResponseAnimationDone(false);
    setSkipResponseAnimation(false);
    responseAnimationKeyRef.current = `response-${selectedLevel}-${Date.now()}`;

    try {
      const response = await executePostAsk(
        `/challenge/${selectedLevel}`,
        { prompt: prompt.trim() }
      );
      
      if (response?.response) {
        setApiResponse(response.response);
      }
    } catch (error) {
      console.error('Error sending prompt:', error);
    } finally {
      setResponseLoading(false);
    }
  };

  const handleCheck = async (secretWord: string) => {
    if (!secretWord.trim() || verifyLoading || !sessionId) return;

    try {
      const response = await executePostVerify(
        `/challenge/${selectedLevel}/verify`,
        { secret: secretWord.trim() }
      );
      
      if (response?.correct === true && response?.level) {
        const currentLevel = response.level;
        const newLevel = Math.min(currentLevel + 1, 10);
        
        await updateData(`users/${sessionId}`, {
          currentLevel: newLevel
        });
        
        setIsCorrect(true);
      }
    } catch (error) {
      console.error('Error verifying secret:', error);
    }
  };

  const reset = () => {
    setApiResponse('');
    setResponseAnimationDone(false);
    setSkipResponseAnimation(false);
    setIsCorrect(false);
    responseAnimationKeyRef.current = '';
  };

  return {
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
    reset,
    responseAnimationKey: responseAnimationKeyRef.current,
  };
};
