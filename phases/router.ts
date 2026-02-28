// phases/router.ts
import type { PhaseId } from "./meta";
import { onManagerEvent } from "./manager";

export type PhaseRoute = (phase: PhaseId) => void;

export type RouterCore = {
  goTo: PhaseRoute;
  dispose: () => void;
};

export function wireRouter(goTo: PhaseRoute): RouterCore {
  const off = onManagerEvent((evt) => {
    if (evt.type === "phase:enter") {
      goTo(evt.phase);
    }
  });

  return { goTo, dispose: off };
}

// React Router v6 adapter
export function routerReact(navigate: (path: string) => void) {
  return wireRouter((phase) => navigate(phaseToPath(phase)));
}

// Terminal adapter (just prints + returns)
export function routerCLI(writeLine: (s: string) => void) {
  return wireRouter((phase) => writeLine(`[PHASE] ${phase}`));
}

// Vanilla adapter (hash-based, prototypes)
export function routerVanilla() {
  return wireRouter((phase) => {
    window.location.hash = phaseToPath(phase);
  });
}

function phaseToPath(phase: PhaseId) {
  // keep it explicit + stable
  switch (phase) {
    case "01_title":
      return "/title";
    case "02_select":
      return "/select";
    case "03_staging":
      return "/staging";
    case "04_draft":
      return "/draft";
    case "05_level":
      return "/level";
    case "06_door":
      return "/door";
    case "07_drop":
      return "/drop";
    default:
      return "/title";
  }
}