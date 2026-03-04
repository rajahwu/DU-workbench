import type { PhaseId, PhaseWallPacket, RunLedger } from "@du/phases/types";

const CHECKPOINT_KEY = "dudael:run_phase_wall";
const CHECKPOINT_VERSION = 1;

export type AppCheckpoint = {
  version: number;
  savedAt: number;
  run: RunLedger;
  phase: {
    current: PhaseId;
    wall: PhaseWallPacket | null;
  };
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function saveCheckpoint(run: RunLedger, phase: AppCheckpoint["phase"]) {
  const checkpoint: AppCheckpoint = {
    version: CHECKPOINT_VERSION,
    savedAt: Date.now(),
    run,
    phase,
  };

  try {
    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint));
  } catch {
    // ignore persistence failures
  }
}

export function loadCheckpoint(): AppCheckpoint | null {
  try {
    const raw = localStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return null;
    if (parsed.version !== CHECKPOINT_VERSION) return null;
    if (!isObject(parsed.run) || !isObject(parsed.phase)) return null;

    return parsed as AppCheckpoint;
  } catch {
    return null;
  }
}

export function clearCheckpoint() {
  try {
    localStorage.removeItem(CHECKPOINT_KEY);
  } catch {
    // ignore
  }
}
