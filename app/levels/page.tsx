import { Suspense } from "react";
import { LEVEL_TEXTS } from "../data/levelTexts";
import { LevelsShell } from "./LevelsShell";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function LevelsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LevelsShell levelTexts={LEVEL_TEXTS} />
    </Suspense>
  );
}
