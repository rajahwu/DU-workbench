// phases/manager.ts
import {
  type PhaseId,
  getRunMeta,
  incDepth,
  incLoop,
  lockIdentity,
  pushPhase,
} from "./meta";

import type { PhasePacket } from "./01_title/title.types";

export type PhaseManagerEvent =
  | {
      type: "phase:enter";
      phase: PhaseId;
      from: PhaseId;
      ts: number;
    }
  | {
      type: "phase:illegal";
      from: PhaseId;
      to: PhaseId;
      reason: string;
      ts: number;
    }
  | {
      type: "phase:transition";
      from: PhaseId;
      to: PhaseId;
      ts: number;
    };

const LEGAL: Record<PhaseId, PhaseId[]> = {
  "01_title": ["02_select"],
  "02_select": ["03_staging"],
  "03_staging": ["04_draft", "02_select"], // allow return to re-pick
  "04_draft": ["05_level", "03_staging"],
  "05_level": ["06_door", "03_staging"],
  "06_door": ["04_draft", "03_staging", "07_drop"],
  "07_drop": ["04_draft", "01_title"], // drop can loop or reset
};

const target = new EventTarget();

let current: PhaseId = "01_title";
let initialized = false;

export function initManager(startPhase: PhaseId = "01_title") {
  current = startPhase;
  initialized = true;
}

export function getPhase(): PhaseId {
  return current;
}

export function onManagerEvent(handler: (evt: PhaseManagerEvent) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<PhaseManagerEvent>).detail);
  target.addEventListener("dudael:manager", fn);
  return () => target.removeEventListener("dudael:manager", fn);
}

function emit(detail: PhaseManagerEvent) {
  target.dispatchEvent(new CustomEvent("dudael:manager", { detail }));
}

function isLegal(from: PhaseId, to: PhaseId) {
  return (LEGAL[from] ?? []).includes(to);
}

// Side effects per transition, as you specified.
function applySideEffects(from: PhaseId, to: PhaseId, packet?: PhasePacket) {
  // Identity locks at 02_select → 03_staging
  if (from === "02_select" && to === "03_staging") {
    lockIdentity({
      userId: packet?.user?.id,
      vessel: packet?.player?.vessel,
      sigil: packet?.player?.sigil,
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

export function transition(to: PhaseId, packet?: PhasePacket) {
  if (!initialized) {
    emit({
      type: "phase:illegal",
      from: current,
      to,
      reason: "manager_not_initialized",
      ts: Date.now(),
    });
    return { ok: false as const, reason: "manager_not_initialized" };
  }

  const from = current;

  if (!isLegal(from, to)) {
    emit({
      type: "phase:illegal",
      from,
      to,
      reason: `illegal_move:${from}->${to}`,
      ts: Date.now(),
    });
    return { ok: false as const, reason: "illegal_move" };
  }

  emit({ type: "phase:transition", from, to, ts: Date.now() });

  current = to;
  pushPhase(to);
  applySideEffects(from, to, packet);

  emit({ type: "phase:enter", phase: to, from, ts: Date.now() });

  return { ok: true as const, phase: to, meta: getRunMeta() };
}