// workbench/phases/01_title/title.types.ts

/**
 * PHASE 01 — TYPES
 * Title-only types + re-export of canonical core contracts.
 */

// Re-export canonical core types for convenience
export type {
  PhaseId,
  Alignment,
  PlayerIdentity,
  PhasePacket,
  Choice,
  Selection,
  GateSelection,
  DescentGuide,
  DescentMode,
  VesselId as EngineVesselId,
} from "../types";

export type UserIdentity = {
  id: string;
  kind: "user";
};

export type ExchangePath = "full" | "lite";