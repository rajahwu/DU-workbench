// phases/router.ts
import type { PhaseId } from "./types";

export const PHASE_PATH: Record<PhaseId, string> = {
  "01_title": "/title",
  "02_select": "/select",
  "03_staging": "/staging",
  "04_draft": "/draft",
  "05_level": "/level",
  "06_door": "/door",
  "07_drop": "/drop",
};

export function phaseToPath(phase: PhaseId): string {
  return PHASE_PATH[phase] ?? "/title";
}

export function pathToPhase(pathname: string): PhaseId | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const effective = clean === "/" ? "/title" : clean;

  const found = (Object.entries(PHASE_PATH) as Array<[PhaseId, string]>).find(
    ([, path]) => path === effective
  );
  return found?.[0] ?? null;
}