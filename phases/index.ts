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

// ✅ canonical shared contracts
export type { PhaseId, Alignment, PlayerIdentity, PhasePacket } from "./types";

// ✅ events are still owned by manager
export type { PhaseManagerEvent } from "./manager";

// ✅ title entry + (optional) exchange helpers
export { mountTitleScreen } from "./01_title/title-screen";
export { titleExchange, loadUserProfile, commitExchange } from "./01_title/title-exchange";
export { DEFAULT_POOL } from "./02_select/pool";

// (optional) if these are still defined in meta and you want them public:
export type { Parity, RunMetaSnapshot } from "./meta";
