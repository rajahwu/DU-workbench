// =============================================================================
// DUDAEL — CARD POOL
// data/cards/pool.ts
//
// Typed card pool using the DraftCard schema from types.ts.
// Surveyor (Light) and Smuggler (Dark) pools.
// Rich cards (LANTERN_AT_THE_THRESHOLD, ROOT_WHISPER) imported from types.ts;
// remaining cards use a builder with sensible defaults.
// =============================================================================

import type { DraftCard, CardMechanics, VisibilityManifest, Keeper, CardTag } from './types';
import { LANTERN_AT_THE_THRESHOLD, ROOT_WHISPER } from './types';

const DEFAULT_VISIBILITY: VisibilityManifest = {
    insight0: ['name', 'keeper', 'lore', 'quote'],
    insight1: ['name', 'keeper', 'lore', 'quote', 'primaryDelta'],
    insight2: ['name', 'keeper', 'lore', 'quote', 'primaryDelta', 'effectSummary'],
    insight3: [
        'name', 'keeper', 'lore', 'quote', 'quoteAttribution',
        'primaryDelta', 'secondaryDeltas', 'effectSummary', 'tags',
    ],
};

function card(
    id: string,
    name: string,
    keeper: Keeper,
    lore: string,
    quote: string,
    mechanics: CardMechanics,
    tags: CardTag[] = [],
    overrides?: Partial<DraftCard>,
): DraftCard {
    return {
        id,
        name,
        keeper,
        lore,
        quote,
        mechanics,
        tags,
        visibility: DEFAULT_VISIBILITY,
        rarity: 'common',
        ...overrides,
    };
}


// ── Surveyor (Light) Pool ────────────────────────────────────────────────────

export const LIGHT_POOL: DraftCard[] = [
    card('card_sanctum_ward', 'Sanctum Ward', 'surveyor',
        'A ward of light pressed into the walls of the upper passages.',
        'Hold this close.',
        { lightDelta: 2 },
        ['STABILITY'],
    ),
    card('card_grace_thread', 'Grace Thread', 'surveyor',
        'A thin filament of sanctified weave, carried since before the sealing.',
        'Even threads hold weight.',
        { lightDelta: 1 },
        ['STABILITY'],
    ),
    card('card_beacon_pulse', 'Beacon Pulse', 'surveyor',
        'A burst of light from the Surveyor\'s own reserves. Brief, blinding.',
        'See everything. Once.',
        { lightDelta: 3 },
        ['SANCTIFIED'],
    ),
    card('card_covenant_seal', 'Covenant Seal', 'surveyor',
        'A seal pressed by the old order. It still holds a charge.',
        'The covenant endures.',
        { lightDelta: 1, heal: 1 },
        ['STABILITY', 'SANCTIFIED'],
    ),
    LANTERN_AT_THE_THRESHOLD,
];


// ── Smuggler (Dark) Pool ─────────────────────────────────────────────────────

export const DARK_POOL: DraftCard[] = [
    card('card_root_cutters_venom', "Root-Cutter's Venom", 'smuggler',
        'Distilled from the root systems below the containment grid.',
        'It burns differently down here.',
        { darkDelta: 2 },
        ['CORRUPTION'],
    ),
    card('card_veil_fragment', 'Veil Fragment', 'smuggler',
        'A shard of the veil between levels. The Smuggler trades in these.',
        'Every crack is a door.',
        { darkDelta: 1 },
        ['RISK'],
    ),
    card('card_abyssal_echo', 'Abyssal Echo', 'smuggler',
        'A sound that returns from depths no vessel has survived.',
        'It called your name.',
        { darkDelta: 3 },
        ['CORRUPTION', 'RISK'],
    ),
    card('card_smugglers_cut', "Smuggler's Cut", 'smuggler',
        'The Smuggler skims from every transaction. This is the fee.',
        'Everyone pays.',
        { darkDelta: 1, points: 2 },
        ['CORRUPTION'],
    ),
    ROOT_WHISPER,
];


// ── Helpers ──────────────────────────────────────────────────────────────────

/** Compute a human-readable effect string from card mechanics. */
export function formatEffect(m: CardMechanics): string {
    const parts: string[] = [];
    if (m.lightDelta && m.lightDelta > 0) parts.push(`+${m.lightDelta} Light`);
    if (m.lightDelta && m.lightDelta < 0) parts.push(`${m.lightDelta} Light`);
    if (m.darkDelta && m.darkDelta > 0) parts.push(`+${m.darkDelta} Dark`);
    if (m.darkDelta && m.darkDelta < 0) parts.push(`${m.darkDelta} Dark`);
    if (m.heal && m.heal > 0) parts.push(`+${m.heal} HP`);
    if (m.points && m.points > 0) parts.push(`+${m.points} PTS`);
    if (m.stabilityDelta && m.stabilityDelta < 0) parts.push('-Stability');
    if (m.stabilityDelta && m.stabilityDelta > 0) parts.push('+Stability');
    return parts.join(', ') || 'No effect';
}
