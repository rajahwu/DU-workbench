// phases/manager.ts
import type { PhaseId, PhaseWallPacket } from "./types";
import {
  getRunMeta,
  incDepth,
  incLoop,
  lockIdentity,
  pushPhase,
} from "./meta";


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
  "05_level": ["06_door"],
  "06_door": ["04_draft", "03_staging", "07_drop"],
  "07_drop": ["04_draft", "01_title", "03_staging"],
};

export function isLegalTransition(from: PhaseId, to: PhaseId): boolean {
  return (LEGAL[from] ?? []).includes(to);
}


function applySideEffects(from: PhaseId, to: PhaseId, wall?: PhaseWallPacket) {
  // Identity lock: read from run/meta or from wall.payload if you still want
  if (from === "02_select" && to === "03_staging") {
    const payload = wall?.payload;
    if (payload && payload.kind === "select->staging") {
      lockIdentity();
    }
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

export function transition(
  from: PhaseId,
  to: PhaseId,
  wall?: PhaseWallPacket,
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

  pushPhase(to);
  applySideEffects(from, to, wall);

  return {
    ok: true,
    from,
    to,
    phase: to,
    meta: getRunMeta(),
    ts,
  };
}

export function getRunLedger() {
  // read from your central run ledger store or from the active packet
  return null;
}

export function engineTransition(
  from: PhaseId,
  to: PhaseId,
  wall?: PhaseWallPacket,
): PhaseManagerResult {
  // This is where you would branch on wall.payload.kind for more complex logic
  return transition(from, to, wall);
} 
