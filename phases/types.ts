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
  | StagingToDraftWall
  | DraftToLevelWall
  | LevelToDoorWall
  | DoorToDropWall
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


export type StagingToDraftWall = {
  kind: "staging->draft";
  runId: string;
};

export type DraftToLevelWall = {
  kind: "draft->level";
  runId: string;
  draftResultId?: string;
};

export type LevelToDoorWall = {
  kind: "level->door";
  runId: string;
};

export type DoorToDropWall = {
  kind: "door->drop";
  runId: string;
  doorChoice?: "light" | "dark" | "secret";
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

export type LegacyPhasePacket = PhasePacket; // rename file-local

export function normalizeLegacyPacket(
  legacy: LegacyPhasePacket,
): { run: Partial<RunLedger>; wall: PhaseWallPacket } {
  const runId = legacy.meta?.runId as string || `run-${legacy.ts}`;

  const runner: RunnerProfile = {
    runnerId: runId,
    userId: legacy.user?.id,
    displayName: legacy.player?.displayName,
    vesselId: (legacy.gate?.vesselId ??
      legacy.identity?.vessel) as VesselId | undefined,
    sigilKey: legacy.identity?.sigil,
  };

  const gateLock = legacy.gate?.vesselId
    ? {
      guide: legacy.gate.guide!,
      mode: legacy.gate.mode!,
      vesselId: legacy.gate.vesselId!,
      lockedAt: legacy.to,
    }
    : undefined;

  const run: Partial<RunLedger> = {
    runId,
    runner,
    gateLock,
    progress: { depth: legacy.depth ?? 0, loopCount: 0 },
    alignment: { current: legacy.alignment ?? { light: 0, dark: 0 } },
    inventory: {
      memoryFragments: 0,
      relicIds: [],
      draftCardIds: legacy.inventory ?? [],
    },
    history: { phaseTrail: [legacy.from, legacy.to] },
  };

  const wall = buildWallPacket(
    legacy.from,
    legacy.to,
    {
      kind: `${legacy.from.replace("01_", "title")
        .replace("02_", "select")
        .replace("03_", "staging")
        .replace("04_", "draft")
        .replace("05_", "level")
        .replace("06_", "door")
        .replace("07_", "drop")}->${legacy.to.replace("01_", "title")
          .replace("02_", "select")
          .replace("03_", "staging")
          .replace("04_", "draft")
          .replace("05_", "level")
          .replace("06_", "door")
          .replace("07_", "drop")}` as PhaseWallPayload["kind"],
      runId,
      runnerRef: { runnerId: runId },
    } as any,  // you can branch kind-specific logic here
  );

  return { run, wall };
}

