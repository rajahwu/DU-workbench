/**
 * PHASE 01 — TYPES
 * Canonical identity and packet contracts.
 * Runtime-agnostic. No framework imports.
 */

// ─────────────────────────────────────────────
// Phase IDs
// ─────────────────────────────────────────────

export type PhaseId =
  | "01_title"
  | "02_select"
  | "03_staging"
  | "04_draft"
  | "05_level"
  | "06_door"
  | "07_drop";

// ─────────────────────────────────────────────
// Identities
// ─────────────────────────────────────────────

export type UserIdentity = {
  id: string;       // "user:vincent" or guest GUID
  kind: "user";
};

export type PlayerIdentity = {
  id: string;       // "player:du-01"
  kind: "player";
  displayName?: string;
  sigil?: string;   // bound identity — what's given
  vessel?: string;  // chosen identity — what's picked
  tags?: string[];
};

// ─────────────────────────────────────────────
// Selection pool
// ─────────────────────────────────────────────

export type SelectionPool<T = PlayerIdentity> = {
  id: string;
  items: T[];
  rules?: {
    maxPick?: number;
    filterTags?: string[];
  };
};

// ─────────────────────────────────────────────
// Phase packet — the contract carried between phases
// ─────────────────────────────────────────────

export type PhasePacket = {
  from: PhaseId;
  to: PhaseId;
  ts: number;

  user: UserIdentity;

  // set after character select
  player?: PlayerIdentity;

  selection?: {
    pool?: SelectionPool<PlayerIdentity>;
    chosen?: PlayerIdentity;
  };

  // alignment accumulates through the run
  alignment?: {
    light: number;  // 0–100
    dark: number;   // 0–100
  };

  // depth — how far into the hourglass
  depth?: number;

  // run-scoped inventory (candy lives here)
  inventory?: string[];

  // phase-scoped metadata
  meta?: Record<string, unknown>;
};

// ─────────────────────────────────────────────
// Exchange path
// ─────────────────────────────────────────────

export type ExchangePath = "full" | "lite";