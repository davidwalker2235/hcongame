'use server';

import { LEVEL_TEXTS } from "../data/levelTexts";
import { LevelsShell } from "./LevelsShell";

export default async function LevelsPage() {
  return <LevelsShell levelTexts={LEVEL_TEXTS} />;
}
