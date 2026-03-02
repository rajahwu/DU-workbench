// phases/manager.ts
import type { PhaseId, PhasePacket } from "./types";
import {
  getRunMeta,
  incDepth,
  incLoop,
  lockIdentity,
  pushPhase,
} from "./meta";

export type { PhasePacket } from "./types";

export type PhaseManagerResult =
  | {
    ok: true;
    from: PhaseId;
    to: PhaseId;
    phase: PhaseId;
    meta: ReturnType<typeof getRunMeta>;
    ts: number;
  }
  | {
    ok: false;
    from: PhaseId;
    to: PhaseId;
    reason: "illegal_move";
    detail: string;
    ts: number;
  };

const LEGAL: Record<PhaseId, PhaseId[]> = {
  "01_title": ["02_select"],
  "02_select": ["03_staging"],
  "03_staging": ["04_draft", "02_select"],
  "04_draft": ["05_level", "03_staging"],
  "05_level": ["06_door", "03_staging", "07_drop"], // Level deaths supported
  "06_door": ["04_draft", "03_staging", "07_drop"],
  "07_drop": ["04_draft", "01_title", "03_staging"], // Summary -> staging allowed
};

export function isLegalTransition(from: PhaseId, to: PhaseId): boolean {
  return (LEGAL[from] ?? []).includes(to);
}

/**
 * Side effects per transition.
 * NOTE: These are run-meta effects only (snapshotting, counters, locks).
 * The *authoritative current phase* should live in the caller (Redux/store).
 */
function applySideEffects(from: PhaseId, to: PhaseId, packet?: PhasePacket) {
  // Identity locks at 02_select → 03_staging
  if (from === "02_select" && to === "03_staging") {
    lockIdentity({
      userId: packet?.user?.id,
      vessel: packet?.identity?.vessel ?? packet?.player?.vessel,
      sigil: packet?.identity?.sigil ?? packet?.player?.sigil,
    });
  }

  // Depth increments on entry to 05_level
  if (to === "05_level") {
    incDepth();
  }

  // Loop count increments on 06_door → 04_draft
  if (from === "06_door" && to === "04_draft") {
    incLoop();
  }
}

/**
 * Pure transition function:
 * - validates legality
 * - applies run-meta side effects (phase history, counters, identity lock)
 * - returns next phase + updated meta snapshot
 *
 * Does NOT store "current" internally.
 */
export function transition(
  from: PhaseId,
  to: PhaseId,
  packet?: PhasePacket
): PhaseManagerResult {
  const ts = Date.now();

  if (!isLegalTransition(from, to)) {
    return {
      ok: false,
      from,
      to,
      reason: "illegal_move",
      detail: `illegal_move:${from}->${to}`,
      ts,
    };
  }

  // Record transition in meta history first (authoritative timeline)
  pushPhase(to);

  // Apply run-meta side effects
  applySideEffects(from, to, packet);

  // Return updated snapshot
  return {
    ok: true,
    from,
    to,
    phase: to,
    meta: getRunMeta(),
    ts,
  };
}

/**
 * Optional: expose the legal map for UI/debug tooling.
 */
export function getLegalTransitions(): Readonly<Record<PhaseId, PhaseId[]>> {
  return LEGAL;
}