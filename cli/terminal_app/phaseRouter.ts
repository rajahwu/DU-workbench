// cli/terminal_app/phaseRouter.ts
import { phaseToPath } from "@du/phases/router";
import type { PhaseId } from "@du/phases";

export function printPhase(writeLine: (s: string) => void, phase: PhaseId) {
    writeLine(`[PHASE] ${phase} (${phaseToPath(phase)})`);
}