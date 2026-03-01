// phases/index.ts
export { boot, recoverRun, commitActivePacket, readActivePacket } from "./boot";
export { initManager, getPhase, transition, onManagerEvent } from "./manager";
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
export { wireRouter, routerReact, routerCLI, routerVanilla } from "./router";

export type { PhaseId, Alignment, Parity, RunMetaSnapshot } from "./meta";
export type { PhasePacket, PhaseManagerEvent } from "./manager";