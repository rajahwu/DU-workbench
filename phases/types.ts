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
  kind?: "player";                // player:...
  displayName?: string;
  vessel?: string;            // vessel:...
  sigil?: string;             // sigil:...
  tags?: string[];            // e.g. ["early_supporter", "beta_tester", ...]
};

export type Selection = {
  pool: SelectionPool<PlayerIdentity>;
  chosen: PlayerIdentity | null;
};

// phases/types.ts
export type PhasePacket = {
  from: PhaseId;
  to: PhaseId;
  ts: number;

  user?: { id?: string };
  identity?: { vessel?: string; sigil?: string };

  player?: PlayerIdentity;

  // ✅ add this:
  selection?: Selection;

  alignment?: Alignment;
  depth?: number;
  inventory?: string[];

  meta?: Record<string, unknown>;
};

export type SelectionPool<T = PlayerIdentity> = {
  id: string;
  items: T[];
  rules?: {
    maxPick?: number;
    filterTags?: string[];
  };
};

