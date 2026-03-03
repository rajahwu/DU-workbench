// phases/index.ts
export { boot, recoverRun, commitActivePacket, readActivePacket } from "./boot";

// new engine transition (pure)
export { transition } from "./manager";

// TEMP compat for old call sites (delete later)
export { transitionTo } from "./transitionTo";

export {
  initRunMeta,
  getRunMeta,
  snapshot,
  restoreSnapshot,
  hydrateFromSnapshot,
  clearSnapshot,
  addToInventory,
  shiftAlignment,
  lockIdentity,
} from "./meta";

// shared router mapping (pure)
export { phaseToPath, pathToPhase, PHASE_PATH } from "./router";

// ✅ canonical shared contracts
export type {
  PhaseId,
  Alignment,
  PlayerIdentity,
  PhasePacket,
  Choice,
  Selection,
  SelectionPool,
  DescentGuide,
  DescentMode,
  VesselId as EngineVesselId,
  GateSelection,
} from "./types";
export { buildPacket } from "./types";

// title entry + (optional) exchange helpers
export { titleExchange, loadUserProfile, commitExchange } from "./01_title/title-exchange";
export { DEFAULT_POOL } from "./02_select/pool";

export type { Parity, RunMetaSnapshot } from "./meta";