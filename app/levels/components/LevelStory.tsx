'use client';

import { TypeAnimation } from 'react-type-animation';
import { AnimatedDots } from '../../components/AnimatedDots';
import { processText } from '../utils/textProcessor';
import styles from '../../components/page.module.css';

type LevelStoryProps = {
  text: string;
  isLoading: boolean;
  shouldAnimate: boolean;
  skipAnimation: boolean;
  animationDone: boolean;
  onAnimationComplete: () => void;
  selectedLevel: number;
};

export const LevelStory = ({
  text,
  isLoading,
  shouldAnimate,
  skipAnimation,
  animationDone,
  onAnimationComplete,
  selectedLevel,
}: LevelStoryProps) => {
  if (isLoading && !text) {
    return (
      <p className={styles.levelDescription} style={{ textAlign: 'center' }}>
        <AnimatedDots text="Loading..." />
      </p>
    );
  }

  if (skipAnimation) {
    return (
      <p className={styles.levelDescription}>
        {processText(text)}
      </p>
    );
  }

  if (shouldAnimate) {
    return (
      <TypeAnimation
        key={`level-description-${selectedLevel}`}
        sequence={[
          text,
          1000,
          onAnimationComplete,
        ]}
        speed={80}
        wrapper="p"
        cursor={true}
        repeat={0}
        className={styles.levelDescription}
        preRenderFirstString={false}
      />
    );
  }

  return (
    <p className={styles.levelDescription}>
      {processText(text)}
    </p>
  );
};
