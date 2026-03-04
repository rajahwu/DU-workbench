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

// Runner = player-in-this-run, not brand identity
export type RunnerProfile = {
  runnerId: string;          // stable per run
  userId?: string;           // Supabase id, optional for guests
  displayName?: string;
  vesselId?: VesselId;       // set after Gate lock
  sigilKey?: string;         // lore key, not Sinerine brand identity
};

// Generic picker (kept for Draft and any pool UIs)
export type Choice<T> = {
  pool: SelectionPool<T>;
  chosen: T | null;
};

export type DescentGuide = "light" | "dark";
export type DescentMode = "steward" | "solo";
export type VesselId = "seraph" | "shadow" | "exile" | "penitent" | "rebel";

export type GateChoice = {
  guide?: DescentGuide;
  mode?: DescentMode;
  vesselId?: VesselId;
};

export type GamePhaseId =
  | "01_title"
  | "02_select"
  | "03_staging"
  | "04_draft"
  | "05_level"
  | "06_door"
  | "07_drop";

export type PlayerIdentity = {
  id?: string;
  userId?: string;
  vessel?: string;
  sigil?: string;
  displayName?: string;
};

export type SelectionPool<T = RunnerProfile> = {
  id: string;
  items: T[];
  rules?: {
    maxPick?: number;
    filterTags?: string[];
  };
};

export type Selection = {
  // deprecated, prefer more specific types like GateSelection
};

export type GateSelection = {
  guide: "light" | "dark";
  mode: "steward" | "solo";
  vesselId: "seraph" | "shadow" | "exile" | "penitent" | "rebel";
};

// What the wall actually carries between specific phases
export type PhaseWallPayload =
  | TitleToSelectWall
  | SelectToStagingWall
  | StagingToSelectWall
  | StagingToDraftWall
  | DraftToLevelWall
  | DraftToStagingWall
  | LevelToDoorWall
  | DoorToDraftWall
  | DoorToStagingWall
  | DoorToDropWall
  | DropToDraftWall
  | DropToTitleWall
  | DropToStagingWall;

export type TitleToSelectWall = {
  kind: "title->select";
  userRef: { userId: string | "guest" };
  pathHint: "lite" | "full";
};

export type SelectToStagingWall = {
  kind: "select->staging";
  runId: string;
  runnerRef: { runnerId: string };
  gateChoice: GateChoice;
  alignmentSnapshot?: Alignment; // only if Staging needs it
};

export type StagingToSelectWall = {
  kind: "staging->select";
  runId: string;
};


export type StagingToDraftWall = {
  kind: "staging->draft";
  runId: string;
};

export type DraftToLevelWall = {
  kind: "draft->level";
  runId: string;
  draftResultId?: string;
};

export type DraftToStagingWall = {
  kind: "draft->staging";
  runId: string;
};

export type LevelToDoorWall = {
  kind: "level->door";
  runId: string;
};

export type DoorToDropWall = {
  kind: "door->drop";
  runId: string;
  doorChoice?: "light" | "dark" | "secret";
  dropReason?: "death" | "math_fail" | "exit";
};

export type DoorToDraftWall = {
  kind: "door->draft";
  runId: string;
  doorChoice?: "light" | "dark" | "secret";
};

export type DoorToStagingWall = {
  kind: "door->staging";
  runId: string;
  doorChoice?: "light" | "dark" | "secret";
};

export type DropToDraftWall = {
  kind: "drop->draft";
  runId: string;
};

export type DropToTitleWall = {
  kind: "drop->title";
  runId: string;
};

export type DropToStagingWall = {
  kind: "drop->staging";
  runId: string;
  dropReason?: "death" | "math_fail" | "exit";
};

export interface PhaseWallPacket {
  fromPhase: GamePhaseId;
  toPhase: GamePhaseId;
  wallAt: number;
  payload: PhaseWallPayload;
  extension?: {
    debug?: unknown;
    experimentTag?: string;
  };
}

export function buildWallPacket(
  from: PhaseId,
  to: PhaseId,
  payload: PhaseWallPayload,
): PhaseWallPacket {
  return buildWallPacketForEdge(from, to, payload);
}

type PhaseEdge = `${PhaseId}->${PhaseId}`;
type PhaseWallKind = PhaseWallPayload["kind"];

const WALL_KINDS_BY_EDGE: Partial<Record<PhaseEdge, PhaseWallKind[]>> = {
  "01_title->02_select": ["title->select"],
  "02_select->03_staging": ["select->staging"],
  "03_staging->02_select": ["staging->select"],
  "03_staging->04_draft": ["staging->draft"],
  "04_draft->03_staging": ["draft->staging"],
  "04_draft->05_level": ["draft->level"],
  "05_level->06_door": ["level->door"],
  "06_door->04_draft": ["door->draft"],
  "06_door->03_staging": ["door->staging"],
  "06_door->07_drop": ["door->drop"],
  "07_drop->04_draft": ["drop->draft"],
  "07_drop->01_title": ["drop->title"],
  "07_drop->03_staging": ["drop->staging"],
};

export function allowedWallKindsForEdge(
  from: PhaseId,
  to: PhaseId,
): readonly PhaseWallKind[] {
  return WALL_KINDS_BY_EDGE[`${from}->${to}`] ?? [];
}

export function assertWallPayloadForEdge(
  from: PhaseId,
  to: PhaseId,
  payload: PhaseWallPayload,
): void {
  const allowed = allowedWallKindsForEdge(from, to);
  if (!allowed.includes(payload.kind)) {
    throw new Error(
      `invalid_wall_payload_kind:${from}->${to}:${payload.kind}`,
    );
  }
}

export function buildWallPacketForEdge(
  from: PhaseId,
  to: PhaseId,
  payload: PhaseWallPayload,
): PhaseWallPacket {
  assertWallPayloadForEdge(from, to, payload);
  return {
    fromPhase: from,
    toPhase: to,
    wallAt: Date.now(),
    payload,
  };
}

export interface RunStatePacket {
  runId: string;
  runner: {
    runnerId: string;                 // stable per run
    userId: string | "guest";
    vesselId?: VesselId;              // set after Select
    sigilKey?: string;                // lore key, not brand identity
    displayName?: string;
  };
  gateLock?: {
    guide: "light" | "dark";
    descentMode: "steward" | "solo";
    vesselId: VesselId;
    lockedAtPhase: GamePhaseId;       // usually "staging"
  };
  progress: {
    depth: number;
    loopCount: number;
  };
  alignment: {
    currentLight: number;
    currentDark: number;
  };
  inventory: {
    memoryFragments: number;
    relicIds: string[];
    draftCardIds: string[];           // last selected cards
  };
  history: {
    phaseTrail: GamePhaseId[];
    lastDoorChoice?: "light" | "dark" | "secret";
    lastDropReason?: "death" | "math-fail" | "exit";
  };
}


export type RunLedger = {
  runId: string;

  runner: RunnerProfile;

  gateLock?: {
    guide: DescentGuide;
    mode: DescentMode;
    vesselId: VesselId;
    lockedAt: PhaseId;          // usually "03_staging"
  };

  progress: {
    depth: number;
    loopCount: number;
  };

  alignment: {
    current: Alignment;
  };

  inventory: {
    memoryFragments: number;
    relicIds: string[];
    draftCardIds: string[];
  };

  history: {
    phaseTrail: PhaseId[];
    lastDoorChoice?: "light" | "dark" | "secret";
    lastDropReason?: "death" | "math_fail" | "exit";
    lastLevelResult?: {
      survived: boolean;
      points: number;
      depth: number;
    };
  };

  // Optional extension buckets
  metaFlags?: {
    penitentInsight: number;
    rebelBreaches: number;
    unlockedCodexKeys: string[];
  };

  // Never required for progression
  telemetry?: {
    totalClicks: number;
    totalRuns: number;
  };

  debugTrace?: Record<string, unknown>;
};

export type PhasePacket = {
  from: PhaseId;
  to: PhaseId;
  ts: number;

  user?: { id?: string };
  identity?: { vessel?: string; sigil?: string };

  player?: PlayerIdentity;

  selection?: Selection; // deprecated

  gate?: GateSelection;

  alignment?: Alignment;
  depth?: number;
  inventory?: string[];

  meta?: Record<string, unknown>;
};


