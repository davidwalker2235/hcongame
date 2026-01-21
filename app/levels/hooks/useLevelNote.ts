'use client';

import { useEffect, useState } from "react";

export const useLevelNote = (selectedLevel: number) => {
  const [note, setNote] = useState("");
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    setNote("");
    setAnimationDone(false);
  }, [selectedLevel]);

  return {
    levelNote: note,
    setLevelNote: setNote,
    animationDone,
    setAnimationDone,
  };
};
