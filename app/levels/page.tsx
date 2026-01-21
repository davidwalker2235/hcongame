'use server';

'use server';

import { Suspense } from "react";
import { LEVEL_TEXTS } from "../data/levelTexts";
import { LevelsShell } from "./LevelsShell";

export default async function LevelsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p>Loading...</p>
        </div>
      }
    >
      <LevelsShell levelTexts={LEVEL_TEXTS} />
    </Suspense>
  );
}
