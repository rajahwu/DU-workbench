// web/react_app/src/app/phaseRoutes.ts
import type { PhaseId } from "@du/phases";

export const phasePath: Record<PhaseId, string> = {
  "01_title": "/title",
  "02_select": "/select",
  "03_staging": "/staging",
  "04_draft": "/draft",
  "05_level": "/level",
  "06_door": "/door",
  "07_drop": "/drop",
};

export function pathToPhase(pathname: string): PhaseId | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const entry = Object.entries(phasePath).find(([, p]) => p === clean);
  return (entry?.[0] as PhaseId) ?? null;
}
