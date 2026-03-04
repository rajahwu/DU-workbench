import type {
  Alignment,
  DescentGuide,
  DescentMode,
  PhaseId,
  VesselId,
} from "./types";

export type { Alignment, PhaseId } from "./types";

export type Parity = "light" | "dark" | "neutral";

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
  identityLocked: boolean;
  updatedAt: number;
};

const STORAGE_KEY = "dudael:run_meta";

function now() {
  return Date.now();
}

function defaultMeta(): RunMetaSnapshot {
  return {
    runId: "",
    runner: {},
    gateLock: undefined,
    progress: { depth: 0, loopCount: 0 },
    alignment: { current: { light: 0, dark: 0 } },
    inventory: { memoryFragments: 0, relicIds: [], draftCardIds: [] },
    history: { phaseTrail: ["01_title"] },
    metaFlags: {
      penitentInsight: 0,
      rebelBreaches: 0,
      unlockedCodexKeys: [],
    },
    identityLocked: false,
    updatedAt: now(),
  };
}

let state: RunMetaSnapshot = defaultMeta();

function touch() {
  state.updatedAt = now();
}

function snapshotUnsafe() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function initRunMeta(runId: string, seed?: Partial<RunMetaSnapshot>) {
  state = {
    ...defaultMeta(),
    ...seed,
    runId,
    runner: { ...defaultMeta().runner, ...(seed?.runner ?? {}) },
    progress: { ...defaultMeta().progress, ...(seed?.progress ?? {}) },
    alignment: {
      current: {
        ...defaultMeta().alignment.current,
        ...(seed?.alignment?.current ?? {}),
      },
    },
    inventory: { ...defaultMeta().inventory, ...(seed?.inventory ?? {}) },
    history: { ...defaultMeta().history, ...(seed?.history ?? {}) },
    metaFlags: { ...defaultMeta().metaFlags, ...(seed?.metaFlags ?? {}) },
  };
  touch();
  snapshot();
}

export function setRunId(runId: string) {
  state.runId = runId;
  touch();
  snapshot();
}

export function getRunMeta(): Readonly<RunMetaSnapshot> {
  return structuredClone(state);
}

export function pushPhase(phase: PhaseId) {
  state.history.phaseTrail.push(phase);
  touch();
  snapshot();
}

export function incDepth() {
  state.progress.depth += 1;
  touch();
  snapshot();
}

export function incLoop() {
  state.progress.loopCount += 1;
  touch();
  snapshot();
}

export function shiftAlignment(delta: Partial<Alignment>) {
  state.alignment.current.light += delta.light ?? 0;
  state.alignment.current.dark += delta.dark ?? 0;
  touch();
  snapshot();
}

export function shiftAlignmentSigned(amount: number) {
  if (amount > 0) shiftAlignment({ light: amount });
  if (amount < 0) shiftAlignment({ dark: Math.abs(amount) });
}

export function lockIdentity() {
  state.identityLocked = true;
  touch();
  snapshot();
}

export function addToInventory(itemId: string): { added: boolean; reason?: string } {
  if (itemId.startsWith("candy:")) {
    state.inventory.memoryFragments += 1;
    touch();
    snapshot();
    return { added: true };
  }

  if (state.inventory.relicIds.includes(itemId)) {
    return { added: false, reason: "duplicate_blocked" };
  }

  state.inventory.relicIds.push(itemId);
  touch();
  snapshot();
  return { added: true };
}

export function snapshot() {
  try {
    snapshotUnsafe();
  } catch {
    // ignore snapshot failures
  }
}

export function restoreSnapshot(): RunMetaSnapshot | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RunMetaSnapshot;
  } catch {
    return null;
  }
}

export function hydrateFromSnapshot(snap: RunMetaSnapshot) {
  state = {
    ...defaultMeta(),
    ...snap,
    runner: { ...defaultMeta().runner, ...(snap.runner ?? {}) },
    progress: { ...defaultMeta().progress, ...(snap.progress ?? {}) },
    alignment: {
      current: {
        ...defaultMeta().alignment.current,
        ...(snap.alignment?.current ?? {}),
      },
    },
    inventory: { ...defaultMeta().inventory, ...(snap.inventory ?? {}) },
    history: { ...defaultMeta().history, ...(snap.history ?? {}) },
    metaFlags: { ...defaultMeta().metaFlags, ...(snap.metaFlags ?? {}) },
  };
  touch();
  snapshot();
}

export function clearSnapshot() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function parityOf(alignment: Alignment): Parity {
  if (alignment.light === alignment.dark) return "neutral";
  return alignment.light > alignment.dark ? "light" : "dark";
}
