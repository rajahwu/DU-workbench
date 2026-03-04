// phases/meta.ts
import type { PhaseId, Alignment } from "./types";
import { getRunLedger } from "./manager";
import type { VesselId, DescentGuide, DescentMode } from "./types";

export type { PhaseId, Alignment } from "./types";

export type Parity = "light" | "dark" | "neutral";
// phases/meta.ts (engine-side snapshot)
export type RunMetaSnapshot = {
  runId: string;

  runner: {
    userId?: string;
    vesselId?: VesselId;
    sigilKey?: string;
  };

  gateLock?: {
    guide: DescentGuide;
    mode: DescentMode;
    vesselId: VesselId;
    lockedAt: PhaseId;
  };

  progress: {
    depth: number;
    loopCount: number;
  };

  alignment: {
    current: Alignment;
  };

  inventory: {
    memoryFragments: number;
    relicIds: string[];
    draftCardIds: string[];
  };

  history: {
    phaseTrail: PhaseId[];
    lastDoorChoice?: "light" | "dark" | "secret";
    lastDropReason?: "death" | "math_fail" | "exit";
  };

  metaFlags: {
    penitentInsight: number;
    rebelBreaches: number;
    unlockedCodexKeys: string[];
  };
};

let _meta: RunMetaSnapshot = {
  runId: "",
  runner: {},
  gateLock: undefined,
  progress: { depth: 0, loopCount: 0 },
  alignment: { current: { light: 0, dark: 0 } },
  inventory: { memoryFragments: 0, relicIds: [], draftCardIds: [] },
  history: { phaseTrail: [] },
  metaFlags: {
    penitentInsight: 0,
    rebelBreaches: 0,
    unlockedCodexKeys: [],
  },
};

export function getRunMeta(): RunMetaSnapshot {
  return _meta;
}

export function setRunId(runId: string) {
  _meta.runId = runId;
}

export function lockIdentity() {
  if (!_meta.runner.userId && !_meta.runner.vesselId) return;
  // persist to whatever long-term store you like (or leave as is)
}

export function incDepth() {
  _meta.progress.depth += 1;
}

export function incLoop() {
  _meta.progress.loopCount += 1;
}

export function pushPhase(phase: PhaseId) {
  _meta.history.phaseTrail.push(phase);
}

const STORAGE_KEY = "dudael:run_meta";

function computeParity(a: Alignment): Parity {
  if (a.light === a.dark) return "neutral";
  return a.light > a.dark ? "light" : "dark";
}

function now() {
  return Date.now();
}

const state: RunMetaSnapshot = {
  sessionId: "",
  depth: 0,
  loopCount: 0,
  alignment: { light: 0, dark: 0 },
  insight: 0,
  parity: "neutral",
  inventory: [],
  phaseHistory: ["01_title"],
  identityLocked: false,
  updatedAt: now(),
};

export function initRunMeta(sessionId: string, seed?: Partial<RunMetaSnapshot>) {
  state.sessionId = sessionId;
  if (seed) Object.assign(state, seed);
  state.parity = computeParity(state.alignment);
  state.updatedAt = now();
  snapshot();
}

export function getRunMeta(): Readonly<RunMetaSnapshot> {
  // return a copy so consumers can't freeze/mutate engine state
  return structuredClone(state);
}

export function pushPhase(phase: PhaseId) {
  state.phaseHistory.push(phase);
  state.updatedAt = now();
  snapshot();
}

export function incDepth() {
  state.depth += 1;
  state.updatedAt = now();
  snapshot();
}

export function incLoop() {
  state.loopCount += 1;
  state.updatedAt = now();
  snapshot();
}

export function shiftAlignment(delta: Partial<Alignment>) {
  state.alignment.light += delta.light ?? 0;
  state.alignment.dark += delta.dark ?? 0;
  state.parity = computeParity(state.alignment);
  state.updatedAt = now();
  snapshot();
}

export function shiftAlignmentSigned(amount: number) {
  if (amount > 0) shiftAlignment({ light: amount });
  if (amount < 0) shiftAlignment({ dark: Math.abs(amount) });
}

export function addToInventory(itemId: string): { added: boolean; reason?: string } {
  const isCandy = itemId.startsWith("candy:");
  if (isCandy) {
    state.inventory.push(itemId); // candy stacks
    state.updatedAt = now();
    snapshot();
    return { added: true };
  }

  if (state.inventory.includes(itemId)) {
    return { added: false, reason: "duplicate_blocked" };
  }

  state.inventory.push(itemId);
  state.updatedAt = now();
  snapshot();
  return { added: true };
}

export function lockIdentity() {
  const run = getRunLedger();
  if (!run) return;

  const userId = run.runner.userId;
  const vessel = run.runner.vesselId;
  const sigil = run.runner.sigilKey;

  // persist this into the meta snapshot however you currently do it
  _lockIdentityInternal({ userId, vessel, sigil });
}
export function snapshot() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // never throw; losing snapshot should not crash the run
  }
}

export function restoreSnapshot(): RunMetaSnapshot | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RunMetaSnapshot;
    return parsed;
  } catch {
    return null;
  }
}

export function hydrateFromSnapshot(snap: RunMetaSnapshot) {
  Object.assign(state, snap);
  state.parity = computeParity(state.alignment);
  state.updatedAt = now();
  snapshot();
}

export function clearSnapshot() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}