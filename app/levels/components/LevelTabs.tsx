'use client';

import styles from "../../components/page.module.css";

type LevelTabsProps = {
  levelCount: number;
  currentLevel: number;
  selectedLevel: number;
  onSelect: (level: number) => void;
};

const clampLevel = (value: number, max: number) =>
  Math.min(Math.max(Math.floor(value), 1), max);

export const LevelTabs = ({
  levelCount,
  currentLevel,
  selectedLevel,
  onSelect,
}: LevelTabsProps) => {
  const levelTabs = Array.from({ length: levelCount }, (_, index) => index + 1);

  return (
    <div className={styles.levelTabs}>
      {levelTabs.map((level) => {
        const isAccessible = level <= clampLevel(currentLevel, levelCount);
        const isActive = level === selectedLevel;

        return (
          <button
            key={`level-tab-${level}`}
            type="button"
            disabled={!isAccessible}
            onClick={() => {
              if (!isAccessible) return;
              onSelect(level);
            }}
            className={[
              styles.levelTab,
              isAccessible ? styles.levelTabAccessible : styles.levelTabLocked,
              isActive ? styles.levelTabActive : "",
            ]
              .join(" ")
              .trim()}
          >
            Nivel {level}
          </button>
        );
      })}
    </div>
  );
};

