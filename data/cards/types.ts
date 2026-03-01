// =============================================================================
// DUDAEL — DRAFT CARD SCHEMA
// game-lore/src/types/card.types.ts
//
// The card is a layered document. Different readers see different versions
// of the same text depending on what they brought to it.
//
// Visibility scales with Insight (global player knowledge level).
// Some cards carry an additional unlock condition beyond Insight —
// a specific lore entry read, a depth survived, a Keeper's favor earned.
// =============================================================================


// -----------------------------------------------------------------------------
// ENUMS & UNIONS
// -----------------------------------------------------------------------------

export type Keeper = 'surveyor' | 'smuggler';

export type CardTag =
  | 'STABILITY'    // Reduces door volatility at high depths
  | 'RISK'         // Carries a negative mechanic, hidden until higher insight
  | 'SANCTIFIED'   // Light-aligned bonus; interacts with Seraph/Penitent vessels
  | 'CORRUPTION'   // Dark-aligned cost; interacts with Shadow/Rebel vessels
  | 'SEALED'       // Card effect is partially locked until unlock condition met
  | 'RELIC'        // Ancient artifact card; Dark cards from before the fall
  | 'THRESHOLD'    // Triggers special behavior at parity extremes
  | 'ECHO';        // Carries forward an effect to the next depth

export type VesselClass =
  | 'seraph'
  | 'shadow'
  | 'exile'
  | 'penitent'
  | 'rebel';

export type UnlockConditionType =
  | 'lore_entry'      // Player read a specific lore entry in Staging
  | 'vessel_depth'    // Player reached a specific depth with a specific vessel
  | 'keeper_favor'    // Player has accumulated favor with a specific keeper
  | 'run_count'       // Player has completed N runs total
  | 'card_history'    // Player has previously drafted a specific card
  | 'parity_extreme'; // Player reached a parity threshold in a previous run


// -----------------------------------------------------------------------------
// VISIBILITY SYSTEM
// -----------------------------------------------------------------------------

// Every field on a card that can be conditionally shown or hidden.
// The render layer checks: is this field in the visibility array for
// the player's current insight level? If yes, show it.
export type VisibleField =
  | 'name'              // Always visible — but listed for completeness
  | 'keeper'            // Keeper attribution (Surveyor / Smuggler)
  | 'lore'              // Flavor/theological text — always visible
  | 'quote'             // Short keeper quote — always visible
  | 'quoteAttribution'  // Who said the quote — revealed at higher insight
  | 'primaryDelta'      // Dominant Light or Dark delta (icon + number)
  | 'secondaryDeltas'   // All other mechanical deltas (heal, points, etc.)
  | 'effectSummary'     // One-line mechanical summary ("Effect: Light +2")
  | 'tags'              // STABILITY, RISK, etc. — strategic metadata
  | 'strategicHint'     // Prose explanation of downstream consequences
  | 'keeperSignal'      // Subtle hint available to 4A Approach screen
  | 'vesselInteraction' // How this card specifically affects player's vessel class
  | 'unlockHint';       // "There is more here" — shown when card has hidden unlock tier


// Insight level: 0–3 (global), derived from Staging Area lore engagement.
// Penitent vessel accumulates Insight faster. Rebel vessel may have Insight penalties.
export type InsightLevel = 0 | 1 | 2 | 3;

export interface VisibilityManifest {
  insight0: VisibleField[];  // Pure narrative — lore + name only
  insight1: VisibleField[];  // + primary delta (dominant Light or Dark)
  insight2: VisibleField[];  // + secondary deltas + effect summary
  insight3: VisibleField[];  // + tags + strategic hint + quote attribution

  // The tier beyond Insight — requires a specific unlock condition.
  // Sits dormant on most cards. Only populated on deep/corrupted cards.
  unlockCondition?: UnlockCondition;
  unlocked?: VisibleField[]; // What reveals when unlock condition is met
}

export interface UnlockCondition {
  type: UnlockConditionType;
  // Flexible reference string. Examples:
  // 'lore_watchers_origin' — specific lore entry ID
  // 'depth_4_survived'     — vessel + depth combination
  // 'keeper_smuggler_3'    — 3 accumulated Smuggler favor
  // 'run_count_5'          — 5 completed runs
  ref: string;
  // Optional human-readable hint shown at insight3 if SEALED tag is present
  hint?: string;
}


// -----------------------------------------------------------------------------
// MECHANICS
// -----------------------------------------------------------------------------

// All numeric effects a card can carry.
// All fields optional — a card may have only one or two effects.
export interface CardMechanics {
  lightDelta?: number;      // Positive or negative Light change
  darkDelta?: number;       // Positive or negative Dark change
  stabilityDelta?: number;  // Positive = more stable, Negative = volatile (RISK)
  heal?: number;            // Health restore
  points?: number;          // Score/progression points
  depthMod?: number;        // Modifies next level difficulty (+1 harder, -1 easier)
  handSizeMod?: number;     // Temporary hand size change for next draft
  keeperFavorDelta?: {      // Changes favor with a specific keeper
    keeper: Keeper;
    amount: number;
  };
}

// Vessel-specific mechanical overrides.
// A card can behave differently depending on who's carrying it.
export interface VesselInteraction {
  vessel: VesselClass;
  mechanicsOverride?: Partial<CardMechanics>; // Different numbers for this vessel
  additionalEffect?: string;                  // Prose description of extra effect
  tagAddition?: CardTag[];                    // Extra tags applied for this vessel
}


// -----------------------------------------------------------------------------
// KEEPER SIGNALS
// -----------------------------------------------------------------------------

// How a card influences the Keeper's presentation on the 4A Approach screen
// before the card is revealed. The attentive return player learns to read
// the Keeper's body language as a meta-signal.
export interface KeeperSignal {
  // Subtle tonal shift in Keeper dialogue when this card is in the pool.
  // The player won't know why the Keeper sounds different — at first.
  approachTone: 'warm' | 'neutral' | 'cold' | 'urgent' | 'evasive';
  // Optional additional dialogue line injected into 4A when this card is present.
  // Should be cryptic enough to not obviously telegraph the card's mechanics.
  approachLine?: string;
}

// Commentary surfaced on the 4C Reckoning screen if this specific card was chosen.
// Can reference parity state, vessel class, or other chosen cards.
export interface ReckoningComment {
  // Default comment shown regardless of context
  default: string;
  // Conditional comments — shown when condition is true, override default
  conditional?: Array<{
    condition: 'paired_with_light' | 'paired_with_dark' | 'high_parity_swing'
      | 'vessel_match' | 'vessel_mismatch' | 'insight_0' | 'insight_3';
    comment: string;
  }>;
}


// -----------------------------------------------------------------------------
// CORE CARD INTERFACE
// -----------------------------------------------------------------------------

export interface DraftCard {
  // --- Identity (always visible) ---
  id: string;
  name: string;
  keeper: Keeper;

  // --- Narrative layer (always visible; changes meaning with knowledge) ---
  lore: string;              // Theological, evocative. Written for Insight 0.
  quote: string;             // Short keeper quote. Cryptic at low insight.
  quoteAttribution?: string; // Who said it — revealed at Insight 3.

  // --- Mechanical layer (gated by insight) ---
  mechanics: CardMechanics;

  // --- Tag layer (gated by insight; carries strategic meaning) ---
  tags: CardTag[];

  // --- Vessel interactions (optional; vessel-specific behavior) ---
  vesselInteractions?: VesselInteraction[];

  // --- Visibility manifest (card describes its own disclosure rules) ---
  visibility: VisibilityManifest;

  // --- Keeper behavior (influences 4A and 4C presentation) ---
  keeperSignal?: KeeperSignal;
  reckoningComment?: ReckoningComment;

  // --- Metadata ---
  rarity?: 'common' | 'uncommon' | 'rare' | 'relic';
  depthRange?: [number, number]; // Min/max depth this card can appear at
  vesselExclusions?: VesselClass[]; // Vessels that cannot receive this card
}


// -----------------------------------------------------------------------------
// DRAFT PACKET — WHAT THE DRAFT ENGINE ASSEMBLES
// -----------------------------------------------------------------------------

// The full context passed into the Draft screens.
// Generated from: vessel class, insight level, staging activity, parity state.
export interface DraftPacket {
  runId: string;
  vessel: VesselClass;
  currentDepth: number;
  insightLevel: InsightLevel;
  currentLight: number;
  currentDark: number;
  stagingActivity: {
    loreEntriesRead: string[];   // IDs of lore entries read this run
    timeInStaging: number;        // Seconds — passive engagement signal
    keeperInteractions: {
      surveyor: number;           // Favor with Surveyor
      smuggler: number;           // Favor with Smuggler
    };
  };
  // The generated card pool for this draft
  lightPool: DraftCard[];         // Cards offered by Surveyor
  darkPool: DraftCard[];          // Cards offered by Smuggler
  // Selection state
  selectedCards: DraftCard[];
  rerollsRemaining: {
    surveyor: number;
    smuggler: number;
  };
}


// -----------------------------------------------------------------------------
// EXAMPLE CARDS
// -----------------------------------------------------------------------------

export const LANTERN_AT_THE_THRESHOLD: DraftCard = {
  id: 'card_lantern_threshold',
  name: 'Lantern at the Threshold',
  keeper: 'surveyor',

  lore: 'A small flame held steady against the descent. The Surveyor marks this as a sanctified offering—once carried by those who walked the upper rings before the quarantine.',
  quote: 'It still burns.',
  quoteAttribution: 'The Surveyor, on the night of the first sealing',

  mechanics: {
    lightDelta: 2,
    stabilityDelta: 1,
    heal: 1,
  },

  tags: ['STABILITY', 'SANCTIFIED'],

  vesselInteractions: [
    {
      vessel: 'penitent',
      mechanicsOverride: { lightDelta: 3 }, // Penitent's lore engagement amplifies Light gain
      additionalEffect: 'Insight increased by 1 for next Staging visit.',
    },
    {
      vessel: 'rebel',
      mechanicsOverride: { stabilityDelta: 0 }, // Rebel cannot hold the flame steady
      additionalEffect: 'Stability bonus negated. The flame flickers.',
    }
  ],

  visibility: {
    insight0: ['name', 'keeper', 'lore', 'quote'],
    insight1: ['name', 'keeper', 'lore', 'quote', 'primaryDelta'],
    insight2: ['name', 'keeper', 'lore', 'quote', 'primaryDelta', 'effectSummary'],
    insight3: [
      'name', 'keeper', 'lore', 'quote', 'quoteAttribution',
      'primaryDelta', 'secondaryDeltas', 'effectSummary',
      'tags', 'strategicHint', 'vesselInteraction'
    ],
  },

  keeperSignal: {
    approachTone: 'warm',
    approachLine: 'Something here remembers the upper rings.',
  },

  reckoningComment: {
    default: 'Light reveals, but demands sacrifice.',
    conditional: [
      {
        condition: 'paired_with_dark',
        comment: 'The Surveyor has noted the contradiction. Light and Dark in the same hand — this will be watched.',
      },
      {
        condition: 'vessel_match',
        comment: 'The Penitent carries the flame well. The Surveyor approves.',
      },
      {
        condition: 'insight_0',
        comment: 'You chose without seeing. The Surveyor calls this faith.',
      }
    ]
  },

  rarity: 'common',
  depthRange: [1, 4],
};


export const ROOT_WHISPER: DraftCard = {
  id: 'card_root_whisper',
  name: 'Root-Whisper',
  keeper: 'smuggler',

  lore: 'Voices from below the containment grid. The Smuggler knows their language—most do not survive learning it.',
  quote: 'Listen closely. Once.',
  quoteAttribution: 'Unknown. The record was sealed.',

  mechanics: {
    darkDelta: 3,
    stabilityDelta: -1,
    points: 2,
  },

  tags: ['RISK', 'CORRUPTION'],

  vesselInteractions: [
    {
      vessel: 'shadow',
      mechanicsOverride: { stabilityDelta: 0 }, // Shadow absorbs the risk
      additionalEffect: 'The voices are familiar. Stability cost negated.',
    },
    {
      vessel: 'seraph',
      mechanicsOverride: { stabilityDelta: -2 }, // Seraph is most destabilized
      additionalEffect: 'The voices are unbearable. Stability cost doubled.',
    }
  ],

  visibility: {
    insight0: ['name', 'keeper', 'lore', 'quote'],
    insight1: ['name', 'keeper', 'lore', 'quote', 'primaryDelta'],
    insight2: ['name', 'keeper', 'lore', 'quote', 'primaryDelta', 'effectSummary'],
    insight3: [
      'name', 'keeper', 'lore', 'quote', 'quoteAttribution',
      'primaryDelta', 'secondaryDeltas', 'effectSummary',
      'tags', 'strategicHint', 'vesselInteraction'
    ],
    // This card has a hidden tier — something the Smuggler isn't saying
    unlockCondition: {
      type: 'vessel_depth',
      ref: 'depth_4_survived',
      hint: 'The voices have more to say to those who have gone deeper.',
    },
    unlocked: [
      'name', 'keeper', 'lore', 'quote', 'quoteAttribution',
      'primaryDelta', 'secondaryDeltas', 'effectSummary',
      'tags', 'strategicHint', 'vesselInteraction', 'unlockHint'
      // At unlock: full card + additional mechanic revealed (to be designed)
    ],
  },

  keeperSignal: {
    approachTone: 'evasive',
    approachLine: 'Something below has been listening for you specifically.',
  },

  reckoningComment: {
    default: 'The Dark remembers what the Light forgets.',
    conditional: [
      {
        condition: 'paired_with_light',
        comment: 'Light and Root-Whisper in the same hand. The Smuggler finds this amusing. The Surveyor does not.',
      },
      {
        condition: 'high_parity_swing',
        comment: 'Your alignment is shifting fast. Door costs will spike at the next depth.',
      },
      {
        condition: 'insight_0',
        comment: 'You chose without seeing. The Smuggler calls this courage. Or ignorance. The difference matters later.',
      }
    ]
  },

  rarity: 'uncommon',
  depthRange: [1, 5],
  vesselExclusions: [], // Available to all — but costs vary significantly
};


// -----------------------------------------------------------------------------
// UTILITY TYPES
// -----------------------------------------------------------------------------

// What the render layer receives per card — computed from DraftCard + context
export interface CardRenderPayload {
  card: DraftCard;
  visibleFields: VisibleField[];   // Computed from insight level + unlock state
  isUnlocked: boolean;             // Has unlock condition been met?
  vesselInteraction?: VesselInteraction; // Active interaction for player's vessel
  isSelected: boolean;
  isHovered: boolean;
}

// Helper to compute visible fields for a given card + context
export function getVisibleFields(
  card: DraftCard,
  insightLevel: InsightLevel,
  isUnlocked: boolean
): VisibleField[] {
  if (isUnlocked && card.visibility.unlocked) {
    return card.visibility.unlocked;
  }
  return card.visibility[`insight${insightLevel}`];
}

// Helper to get active vessel interaction for a card
export function getVesselInteraction(
  card: DraftCard,
  vessel: VesselClass
): VesselInteraction | undefined {
  return card.vesselInteractions?.find(v => v.vessel === vessel);
}