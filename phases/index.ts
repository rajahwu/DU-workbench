// phases/index.ts

// Core Engine API
export { initManager, getPhase, transition, onManagerEvent } from "./manager";
export type { PhaseManagerEvent } from "./manager";

// State & Meta API
export { initRunMeta, getRunMeta, restoreSnapshot, hydrateFromSnapshot, clearSnapshot } from "./meta";
export type { PhaseId, RunMetaSnapshot, Alignment, Parity } from "./meta";

// Router Adapters
export { routerReact, routerCLI, routerVanilla, wireRouter } from "./router";

// Bootloader
export { boot, recoverRun } from "./boot";

// Canonical Types (Exported from the rich title.types)
export type { 
  PhasePacket, 
  UserIdentity, 
  PlayerIdentity, 
  SelectionPool, 
  ExchangePath 
} from "./01_title/title.types";