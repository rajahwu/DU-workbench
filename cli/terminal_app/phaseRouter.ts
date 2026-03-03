// cli/terminal_app/phaseRouter.ts
import { phaseToPath } from "../../phases/router";
import type { PhaseId } from "../../phases/types";

export function printPhase(writeLine: (s: string) => void, phase: PhaseId) {
    writeLine(`[PHASE] ${phase} (${phaseToPath(phase)})`);
}