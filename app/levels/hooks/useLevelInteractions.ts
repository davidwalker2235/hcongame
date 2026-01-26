'use client';

import { useEffect, useRef } from 'react';

type UseLevelInteractionsProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  animationDone: boolean;
  skipAnimation: boolean;
  setSkipAnimation: (value: boolean) => void;
  setAnimationDone: (value: boolean) => void;
  responseAnimationDone: boolean;
  skipResponseAnimation: boolean;
  setSkipResponseAnimation: (value: boolean) => void;
  setResponseAnimationDone: (value: boolean) => void;
  apiResponse: string;
};

export const useLevelInteractions = ({
  containerRef,
  animationDone,
  skipAnimation,
  setSkipAnimation,
  setAnimationDone,
  responseAnimationDone,
  skipResponseAnimation,
  setSkipResponseAnimation,
  setResponseAnimationDone,
  apiResponse,
}: UseLevelInteractionsProps) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInteractiveElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'BUTTON' ||
        target.closest('button') !== null ||
        target.closest('input') !== null ||
        target.closest('textarea') !== null;
      
      if (isInteractiveElement) return;

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

    container.addEventListener('click', handleInteraction, { capture: true });
    container.addEventListener('touchstart', handleInteraction, { passive: true, capture: true });

    return () => {
      container.removeEventListener('click', handleInteraction, { capture: true } as any);
      container.removeEventListener('touchstart', handleInteraction, { capture: true } as any);
    };
  }, [
    containerRef,
    animationDone,
    skipAnimation,
    setSkipAnimation,
    setAnimationDone,
    responseAnimationDone,
    skipResponseAnimation,
    setSkipResponseAnimation,
    setResponseAnimationDone,
    apiResponse,
  ]);
};
