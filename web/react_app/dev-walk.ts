import { getPhase, transition, getRunMeta } from "@du/phases";

export function installPhaseWalkHotkeys() {
  window.addEventListener("keydown", (e) => {
    if (!e.shiftKey) return;

    const from = getPhase();
    switch (e.key) {
      case "S": transition("03_staging"); break;
      case "D": transition("04_draft"); break;
      case "L": transition("05_level"); break;
      case "O": transition("06_door"); break;
      case "X": transition("07_drop"); break;
      default: return;
    }

    const meta = getRunMeta();
    console.log("[DUDAEL]", `${from} → ${getPhase()}`, {
      depth: meta.depth,
      loopCount: meta.loopCount
    });
  });
}