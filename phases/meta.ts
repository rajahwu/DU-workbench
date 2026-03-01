// phases/meta.ts
import type { PhaseId, Alignment } from "./types";
export type { PhaseId, Alignment } from "./types";

export type Parity = "light" | "dark" | "neutral";

export type RunMetaSnapshot = {
  sessionId: string;
  depth: number;
  loopCount: number;
  alignment: Alignment;
  insight: number;
  parity: Parity;
  inventory: string[];
  phaseHistory: PhaseId[];
  identityLocked: boolean;
  identity?: {
    userId?: string;
    vessel?: string;
    sigil?: string;
  };
  updatedAt: number;
};

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
  return state;
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

export function lockIdentity(identity: NonNullable<RunMetaSnapshot["identity"]>) {
  if (state.identityLocked) return;
  state.identityLocked = true;
  state.identity = { ...(state.identity ?? {}), ...identity };
  state.updatedAt = now();
  snapshot();
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