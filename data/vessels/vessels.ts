// =============================================================================
// DUDAEL — VESSEL CONFIGURATION
// src/app/data/vessels.ts
//
// Single source of truth for all five Vessel classes.
// Presentation layer (theology, sigils, SVGs, lore text) stays in SelectShell.
// This file is the bridge between lore identity and engine behavior.
//
// Wire into:
//   - SelectShell       → handleLockVessel writes player.stats to packet
//   - Redux slice        → initialize light, dark, maxHealth, handSize
//   - DraftShell         → draftBias skews Surveyor/Smuggler pool composition
//   - Level reducer      → mechanics knobs adjust damage, points, timer
//   - StagingShell       → usesInsight triggers Insight UI for Penitent
//   - Door logic         → doorCostModifier adjusts Light/Dark costs
//   - Drop / Loop        → metaCounter drives Breach (Rebel) / Confessions (Penitent)
// =============================================================================


// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type VesselId = 'SERAPH' | 'SHADOW' | 'EXILE' | 'PENITENT' | 'REBEL';

export type AlignmentBias = 'light' | 'dark' | 'balanced';

export type DraftBias = 'light' | 'dark' | 'neutral';

// Per-vessel mechanical knobs.
// All fields optional — only populate what's active for this vessel.
// Dormant fields (undefined) mean: use the baseline game value.
export interface VesselMechanics {

    // --- Level / Combat ---

    // Bonus points per successful hit on top of baseline (+1).
    // Rebel: 1 → each hit scores +2 total.
    extraPointsPerHit?: number;

    // Bonus damage per miss on top of baseline (1).
    // Rebel: 1 → each miss deals 2 damage total.
    extraDamagePerMiss?: number;

    // Every Nth miss is forgiven (no damage).
    // Shadow: 3 → every third miss is absorbed.
    missForgivenessEveryN?: number;

    // Multiplier on timer decay rate. < 1.0 = slower decay = more time.
    // Penitent: 0.85 → timer drains 15% slower.
    // Default: 1.0
    timerMultiplier?: number;

    // Heal amount on a perfect level (zero misses).
    // Penitent: 1 → +1 health for a clean run.
    perfectLevelHeal?: number;

    // --- Draft ---

    // Additional Dark cards pulled into offering pool when bias is 'dark'.
    // Rebel: 1 → pulls 1 extra Dark card, giving 3 Dark : 1 Light.
    extraDarkPoolCards?: number;

    // Additional Light cards pulled into offering pool when bias is 'light'.
    // Seraph: 1 → pulls 1 extra Light card, giving 3 Light : 1 Dark.
    extraLightPoolCards?: number;

    // --- Door ---

    // Modifier on Dark door cost. Negative = cheaper.
    // Rebel: -1 → Dark doors cost max(1, depth) instead of depth+1.
    darkDoorCostMod?: number;

    // Modifier on Light door cost. Positive = more expensive.
    // Rebel: +1 → Light doors cost depth+2 instead of depth+1.
    lightDoorCostMod?: number;

    // Threshold of (dark - light) at which the Secret door appears.
    // Rebel: 2 → Secret door appears when dark > light + 2.
    // Default: 3 (from systems map)
    secretDoorThreshold?: number;

    // Whether this vessel sees clearer door cost math in the UI at high Insight.
    // Penitent: true → shows "You have X Light; this door costs Y" at Insight >= 2.
    showDoorCostBreakdown?: boolean;

    // --- Staging ---

    // Whether this vessel tracks and accumulates Insight from lore reading.
    // Penitent: true. All others: undefined / false.
    usesInsight?: boolean;

    // Seconds a lore entry must be open to grant +1 Insight.
    // Penitent: 2.5
    insightReadThresholdSecs?: number;

    // Max Insight this vessel can accumulate in one run.
    // Penitent: 3
    insightCap?: number;

    // Whether this vessel shows an Instability indicator in Staging.
    // Rebel: true → shows when dark - light >= 3.
    showsInstability?: boolean;

    // Threshold of (dark - light) at which Instability indicator appears.
    // Rebel: 3
    instabilityThreshold?: number;

    // --- Drop / Meta ---

    // Name of the meta counter this vessel increments on Drop.
    // Penitent: 'confessions', Rebel: 'breach'
    metaCounter?: 'confessions' | 'breach' | 'loops';

    // Condition required on Drop to increment the meta counter.
    // Penitent: 'insight_gt_0' — must have read lore that run.
    // Rebel: 'dark_gt_light_plus_3' — must have gone deep Dark.
    metaCounterCondition?: 'insight_gt_0' | 'dark_gt_light_plus_3' | 'always';

    // How many meta counter increments before an unlock triggers.
    // Rebel: 3 → after 3 Breach drops, extra Dark card or codex entry unlocked.
    metaUnlockThreshold?: number;
}


// Full vessel configuration shape.
export interface VesselConfig {
    id: VesselId;
    displayName: string;
    shortLabel: string;        // Roman numeral I–V for compact UI display
    alignment: AlignmentBias;
    draftBias: DraftBias;

    // Starting run stats — written to Redux / packet on Lock Vessel
    startingLight: number;
    startingDark: number;
    maxHealth: number;
    handSize: number;

    // Short tooltip line shown on hover in SelectShell
    engineNote: string;

    // All mechanical knobs — undefined = use baseline
    mechanics: VesselMechanics;
}


// Shape written into packet.player.stats on Lock Vessel
export interface VesselPacketStats {
    vesselId: VesselId;
    startingLight: number;
    startingDark: number;
    maxHealth: number;
    handSize: number;
    draftBias: DraftBias;
    usesInsight: boolean;
    showsInstability: boolean;
}


// -----------------------------------------------------------------------------
// VESSEL REGISTRY
// -----------------------------------------------------------------------------

export const VESSELS: Record<VesselId, VesselConfig> = {

    // ── I. SERAPH ──────────────────────────────────────────────────────────────
    // Highest order. Total proximity to Light before the fall.
    // Carries that memory — and that weight.
    // Plays with partial blindness: remembers everything, sees partially.
    SERAPH: {
        id: 'SERAPH',
        displayName: 'The Seraph',
        shortLabel: 'I',
        alignment: 'light',
        draftBias: 'light',
        startingLight: 3,
        startingDark: 0,
        maxHealth: 10,
        handSize: 2,
        engineNote: 'High Light start. Dark voices are most destabilizing.',
        mechanics: {
            extraLightPoolCards: 1,        // 3 Light : 1 Dark in draft pool
            timerMultiplier: 1.0,
            // RISK card Stability cost doubled (handled in card.types.ts vesselInteractions)
            // Partial blindness mechanic: TBD — possible reduced card visibility
            // at high Dark parity, as if "overwhelmed"
        },
    },

    // ── II. SHADOW ─────────────────────────────────────────────────────────────
    // Defined by concealment. Moves through Dudael via absence, not force.
    // Evasion-based. Absorbs Risk — the voices are familiar.
    SHADOW: {
        id: 'SHADOW',
        displayName: 'The Shadow',
        shortLabel: 'II',
        alignment: 'dark',
        draftBias: 'dark',
        startingLight: 0,
        startingDark: 3,
        maxHealth: 10,
        handSize: 2,
        engineNote: 'Absorbs Risk cards. Miss forgiveness every 3rd hit.',
        mechanics: {
            extraDarkPoolCards: 1,         // 1 Light : 3 Dark in draft pool
            missForgivenessEveryN: 3,      // every third miss absorbed
            timerMultiplier: 1.0,
            // CORRUPTION card Stability cost negated (in vesselInteractions)
        },
    },

    // ── III. EXILE ─────────────────────────────────────────────────────────────
    // Cast out, not fallen. There is a difference.
    // Did not choose and did not slip — was removed.
    // Adaptive generalist. Mechanics TBD — distinct from both.
    EXILE: {
        id: 'EXILE',
        displayName: 'The Exile',
        shortLabel: 'III',
        alignment: 'balanced',
        draftBias: 'neutral',
        startingLight: 2,
        startingDark: 2,
        maxHealth: 10,
        handSize: 2,
        engineNote: 'Balanced. Adaptive. Mechanics reflect removal, not choice.',
        mechanics: {
            timerMultiplier: 1.0,
            // Exile's unique mechanic: TBD
            // Candidate: resilience modifier — takes reduced damage at low health
            // Candidate: door cost discount when parity is exactly balanced
        },
    },

    // ── IV. PENITENT ───────────────────────────────────────────────────────────
    // Seeking atonement or understanding.
    // Most engaged with lore. Mechanics reward engagement.
    // The "lore brain" — clarity compounds over runs.
    PENITENT: {
        id: 'PENITENT',
        displayName: 'The Penitent',
        shortLabel: 'IV',
        alignment: 'light',
        draftBias: 'neutral',
        startingLight: 3,
        startingDark: 1,
        maxHealth: 12,
        handSize: 2,
        engineNote: 'Reads the record. Insight unlocks card clarity in Draft.',
        mechanics: {
            usesInsight: true,
            insightReadThresholdSecs: 2.5, // seconds on lore entry → +1 Insight
            insightCap: 3,
            timerMultiplier: 0.85,         // 15% slower timer decay in Level
            perfectLevelHeal: 1,           // +1 health for zero-miss level
            showDoorCostBreakdown: true,   // clearer door math at Insight >= 2
            metaCounter: 'confessions',
            metaCounterCondition: 'insight_gt_0',
            metaUnlockThreshold: 3,        // 3 Confession drops → codex unlock
        },
    },

    // ── V. REBEL ───────────────────────────────────────────────────────────────
    // Chose the fall. Knew the cost, made the move.
    // Most agency, most instability. Glass cannon. Aggressive disruptor.
    REBEL: {
        id: 'REBEL',
        displayName: 'The Rebel',
        shortLabel: 'V',
        alignment: 'dark',
        draftBias: 'dark',
        startingLight: 1,
        startingDark: 3,
        maxHealth: 8,
        handSize: 3,
        engineNote: 'Chose the Drop. High Dark start. High risk, high reward.',
        mechanics: {
            extraDarkPoolCards: 1,         // 1 Light : 3 Dark in draft pool
            extraPointsPerHit: 1,          // baseline +1 → Rebel +2 per hit
            extraDamagePerMiss: 1,         // baseline 1 → Rebel 2 per miss
            darkDoorCostMod: -1,           // Dark doors: max(1, depth) instead of depth+1
            lightDoorCostMod: 1,           // Light doors: depth+2 instead of depth+1
            secretDoorThreshold: 2,        // Secret door at dark > light + 2 (lower than default 3)
            showsInstability: true,
            instabilityThreshold: 3,       // Instability UI at dark - light >= 3
            metaCounter: 'breach',
            metaCounterCondition: 'dark_gt_light_plus_3',
            metaUnlockThreshold: 3,        // 3 Breach drops → extra Dark card or codex entry
        },
    },
};


// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

// Safe lookup — returns null if id is missing or invalid.
export function getVesselConfig(id: VesselId | null | undefined): VesselConfig | null {
    if (!id) return null;
    return VESSELS[id] ?? null;
}

// Build the compact stats object written into packet.player.stats on Lock Vessel.
export function buildVesselPacketStats(id: VesselId): VesselPacketStats {
    const config = VESSELS[id];
    return {
        vesselId: id,
        startingLight: config.startingLight,
        startingDark: config.startingDark,
        maxHealth: config.maxHealth,
        handSize: config.handSize,
        draftBias: config.draftBias,
        usesInsight: config.mechanics.usesInsight ?? false,
        showsInstability: config.mechanics.showsInstability ?? false,
    };
}

// Compute draft pool composition for a given vessel and current parity state.
// Returns how many Light and Dark cards to pull from each keeper's pool.
export function getDraftPoolCounts(
    vesselId: VesselId,
    currentLight: number,
    currentDark: number
): { lightCards: number; darkCards: number } {
    const config = VESSELS[vesselId];
    const instabilityActive =
        config.mechanics.showsInstability &&
        (currentDark - currentLight) >= (config.mechanics.instabilityThreshold ?? 3);

    let lightCards = 2;
    let darkCards = 2;

    if (config.draftBias === 'light') {
        lightCards += config.mechanics.extraLightPoolCards ?? 0;
        darkCards -= config.mechanics.extraLightPoolCards ?? 0;
    } else if (config.draftBias === 'dark') {
        darkCards += config.mechanics.extraDarkPoolCards ?? 0;
        lightCards -= config.mechanics.extraDarkPoolCards ?? 0;
    }

    // Instability override: Rebel at high Dark → 1 Light : 3 Dark
    if (instabilityActive) {
        lightCards = 1;
        darkCards = 3;
    }

    // Clamp to at least 1 of each to avoid empty pools
    return {
        lightCards: Math.max(1, lightCards),
        darkCards: Math.max(1, darkCards),
    };
}

// Compute door costs for a given vessel and depth.
export function getDoorCosts(
    vesselId: VesselId,
    depth: number
): { lightCost: number; darkCost: number; secretVisible: boolean; currentDark: number; currentLight: number } {
    const config = VESSELS[vesselId];
    const m = config.mechanics;

    const baseCost = depth + 1;
    const lightCost = baseCost + (m.lightDoorCostMod ?? 0);
    const darkCost = Math.max(1, baseCost + (m.darkDoorCostMod ?? 0));

    // Secret door visibility is determined at call site with current parity —
    // this just returns the threshold for the caller to check against.
    return {
        lightCost,
        darkCost,
        secretVisible: false, // caller checks: (currentDark - currentLight) >= secretDoorThreshold
        currentDark: 0,       // caller fills these in
        currentLight: 0,
    };
}

// Compute level combat deltas for a given vessel.
export function getLevelCombatDeltas(vesselId: VesselId): {
    pointsPerHit: number;
    damagePerMiss: number;
    timerMultiplier: number;
    missForgivenessEveryN: number | null;
    perfectLevelHeal: number;
} {
    const m = VESSELS[vesselId].mechanics;
    return {
        pointsPerHit: 1 + (m.extraPointsPerHit ?? 0),
        damagePerMiss: 1 + (m.extraDamagePerMiss ?? 0),
        timerMultiplier: m.timerMultiplier ?? 1.0,
        missForgivenessEveryN: m.missForgivenessEveryN ?? null,
        perfectLevelHeal: m.perfectLevelHeal ?? 0,
    };
}

// Check whether meta counter should increment on Drop.
export function shouldIncrementMetaCounter(
    vesselId: VesselId,
    endOfRunState: { insight: number; currentLight: number; currentDark: number }
): boolean {
    const config = VESSELS[vesselId];
    const condition = config.mechanics.metaCounterCondition;
    if (!condition || !config.mechanics.metaCounter) return false;

    switch (condition) {
        case 'insight_gt_0':
            return endOfRunState.insight > 0;
        case 'dark_gt_light_plus_3':
            return endOfRunState.currentDark > endOfRunState.currentLight + 3;
        case 'always':
            return true;
        default:
            return false;
    }
}

// Get the secret door threshold for a vessel (with fallback to game default).
export function getSecretDoorThreshold(vesselId: VesselId): number {
    return VESSELS[vesselId].mechanics.secretDoorThreshold ?? 3;
}


// -----------------------------------------------------------------------------
// USAGE REFERENCE
// -----------------------------------------------------------------------------
//
// SelectShell — Lock Vessel:
//   import { buildVesselPacketStats } from '@/app/data/vessels';
//   const stats = buildVesselPacketStats(activeVesselId);
//   updatedPacket.player = { vessel: activeVesselId, stats };
//
// Redux slice — initialize run:
//   const stats = action.payload.player.stats;
//   state.light = stats.startingLight;
//   state.dark = stats.startingDark;
//   state.health = stats.maxHealth;
//   state.maxHealth = stats.maxHealth;
//   state.handSize = stats.handSize;
//   state.vesselId = stats.vesselId;
//
// DraftShell — build pool:
//   import { getDraftPoolCounts } from '@/app/data/vessels';
//   const { lightCards, darkCards } = getDraftPoolCounts(vesselId, currentLight, currentDark);
//
// Level reducer — combat deltas:
//   import { getLevelCombatDeltas } from '@/app/data/vessels';
//   const deltas = getLevelCombatDeltas(state.vesselId);
//   // on hit: state.points += deltas.pointsPerHit;
//   // on miss: state.health -= deltas.damagePerMiss;
//   // timer: decay *= deltas.timerMultiplier;
//
// Door logic — costs:
//   import { getDoorCosts, getSecretDoorThreshold } from '@/app/data/vessels';
//   const { lightCost, darkCost } = getDoorCosts(vesselId, depth);
//   const secretVisible = (currentDark - currentLight) >= getSecretDoorThreshold(vesselId);
//
// Drop — meta counter:
//   import { shouldIncrementMetaCounter } from '@/app/data/vessels';
//   if (shouldIncrementMetaCounter(vesselId, { insight, currentLight, currentDark })) {
//     metaCounters[config.mechanics.metaCounter]++;
//   }