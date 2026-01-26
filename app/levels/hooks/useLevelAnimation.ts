'use client';

import { useState, useEffect, useRef } from 'react';

export const useLevelAnimation = (selectedLevel: number, levelStory: string) => {
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [animatingText, setAnimatingText] = useState<string>('');
  const animationInProgressRef = useRef<boolean>(false);

  useEffect(() => {
    setSkipAnimation(false);
    setAnimationDone(false);
    setAnimatingText('');
    animationInProgressRef.current = false;
  }, [selectedLevel]);

  useEffect(() => {
    if (levelStory && !animationDone && !skipAnimation && !animationInProgressRef.current && animatingText !== levelStory) {
      setAnimatingText(levelStory);
    }
  }, [levelStory, animationDone, skipAnimation, animatingText]);

  return {
    skipAnimation,
    setSkipAnimation,
    animationDone,
    setAnimationDone,
    animatingText,
    setAnimatingText,
    animationInProgressRef,
  };
};
