// phases/types.ts
export type PhaseId =
  | "01_title"
  | "02_select"
  | "03_staging"
  | "04_draft"
  | "05_level"
  | "06_door"
  | "07_drop";

export type Alignment = { light: number; dark: number };

export type PlayerIdentity = {
  id: string;
  // kind?: "player";                // player:...
  displayName?: string;
  vessel?: string;            // vessel:...
  sigil?: string;             // sigil:...
  // tags?: string[];            // e.g. ["early_supporter", "beta_tester", ...]
};

// ── Generic picker (retained for Draft and future pool-based UIs) ──────────
export type Choice<T> = {
  pool: SelectionPool<T>;
  chosen: T | null;
};

/**
 * @deprecated Use `Choice<PlayerIdentity>` instead.
 * Kept temporarily so existing serialized packets don't break at runtime.
 */
export type Selection = Choice<PlayerIdentity>;

// ── Gate selection: the 3-step Select flow (Guide → Mode → Vessel) ─────────
export type DescentGuide = "light" | "dark";
export type DescentMode  = "steward" | "solo";
export type VesselId     = "seraph" | "shadow" | "exile" | "penitent" | "rebel";

export type GateSelection = {
  guide?:    DescentGuide;
  mode?:     DescentMode;
  vesselId?: VesselId;
};

// ── Phase packet: the contract that carries state between phases ───────────
export type PhasePacket = {
  from: PhaseId;
  to: PhaseId;
  ts: number;

  user?: { id?: string };
  identity?: { vessel?: string; sigil?: string };

  player?: PlayerIdentity;

  /** @deprecated Prefer `gate` for the Select phase. Retained for title-exchange compat. */
  selection?: Selection;

  /** New canonical field — written by the 3-step Gate (02_select) */
  gate?: GateSelection;

  alignment?: Alignment;
  depth?: number;
  inventory?: string[];

  meta?: Record<string, unknown>;
};

// ── Packet builder: eliminates partial-cast-to-full issues ─────────────────
export function buildPacket(
  from: PhaseId,
  to: PhaseId,
  patch?: Partial<PhasePacket>,
): PhasePacket {
  return {
    from,
    to,
    ts: Date.now(),
    ...patch,
  };
}

export type SelectionPool<T = PlayerIdentity> = {
  id: string;
  items: T[];
  rules?: {
    maxPick?: number;
    filterTags?: string[];
  };
};

