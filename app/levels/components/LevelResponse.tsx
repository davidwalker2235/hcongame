'use client';

import { TypeAnimation } from 'react-type-animation';
import { processText } from '../utils/textProcessor';
import styles from '../../components/page.module.css';

type LevelResponseProps = {
  response: string;
  skipAnimation: boolean;
  animationDone: boolean;
  onAnimationComplete: () => void;
  selectedLevel: number;
  animationKey: string;
};

export const LevelResponse = ({
  response,
  skipAnimation,
  animationDone,
  onAnimationComplete,
  selectedLevel,
  animationKey,
}: LevelResponseProps) => {
  if (!response) return null;

  if (skipAnimation) {
    return (
      <div style={{ marginTop: '20px' }}>
        <p className={styles.levelDescription}>
          {processText(response)}
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <TypeAnimation
        key={animationKey || `response-${selectedLevel}`}
        sequence={[
          response,
          1000,
          onAnimationComplete,
        ]}
        speed={40}
        wrapper="p"
        cursor={true}
        repeat={0}
        className={styles.levelDescription}
      />
    </div>
  );
};
