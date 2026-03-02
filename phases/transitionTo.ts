// phases/transitionTo.ts
import type { PhaseId, PhasePacket } from "./types";
import { transition } from "./manager";
import { restoreSnapshot } from "./meta";

function inferCurrentPhase(): PhaseId {
    const snap = restoreSnapshot();
    const last = snap?.phaseHistory?.[snap.phaseHistory.length - 1];
    return (last as PhaseId) ?? "01_title";
}

/**
 * TEMP COMPAT:
 * Allows legacy call sites: transitionTo("03_staging", packet)
 * by inferring "from" from snapshot history.
 *
 * Delete this once all call sites dispatch Redux requestTransition.
 */
export function transitionTo(to: PhaseId, packet?: PhasePacket) {
    const from = packet?.from ?? inferCurrentPhase();
    return transition(from, to, packet);
}