# DUDAEL Workbench — Data Layer Refactor Report
**Timestamp**: 2026-03-01T16:51:18Z  
**Author**: Copilot  
**Scope**: Shell refactoring — extract hardcoded game data to typed data layer

---

## Summary

All five gameplay shell components (`SelectShell`, `DraftShell`, `LevelShell`, `DoorShell`, `DropShell`) were refactored to consume vessel configuration and card data from the centralized `data/` directory instead of using inline hardcoded values. A new typed card pool was created. Build passes with zero new errors.

---

## Changes Made

### Config
| File | Change |
|---|---|
| `web/react_app/vite.config.ts` | Added `@data` path alias → `../../data` |
| `web/react_app/tsconfig.json` | Added `@data/*` path mapping to match |

### New File
| File | Lines | Purpose |
|---|---|---|
| `data/cards/pool.ts` | 125 | Typed card pool (`LIGHT_POOL`, `DARK_POOL`) using `DraftCard` schema from `types.ts`. Imports `LANTERN_AT_THE_THRESHOLD` and `ROOT_WHISPER` as canonical entries. Defines 8 additional prototype cards. Exports `formatEffect()` helper for rendering mechanic deltas as human-readable strings. |

### Shell Refactors

| Shell | Import | Function Wired | What Changed |
|---|---|---|---|
| **SelectShell** | `buildVesselPacketStats`, `VesselId` | `buildVesselPacketStats()` | Lock Vessel now writes typed `VesselPacketStats` (startingLight, startingDark, maxHealth, handSize, draftBias, usesInsight, showsInstability) to `packet.player.stats`. Vessel ID uppercased to match `VesselId` union. Presentation data (theology, SVGs, colors, tags) intentionally stays in shell per `vessels.ts` design comment. |
| **DraftOffering** | `LIGHT_POOL`, `DARK_POOL`, `formatEffect`, `DraftCard`, `getDraftPoolCounts`, `VesselId` | `getDraftPoolCounts()` | Inline `cardPool` object deleted (14 LOC). Pool composition is now vessel-aware — Seraph gets 3L:1D, Shadow/Rebel get 1L:3D, Exile/Penitent get 2:2. Instability override (Rebel at high Dark) gives 1L:3D. Cards typed as `DraftCard` instead of `any`. Effect strings computed via `formatEffect(card.mechanics)`. |
| **DraftReckoning** | `formatEffect`, `DraftCard` | — | Card property access updated: `c.light` → `c.mechanics.lightDelta`, `c.dark` → `c.mechanics.darkDelta`. Effect display uses `formatEffect()`. `any` types replaced with `DraftCard`. |
| **LevelShell** | `VESSELS`, `getLevelCombatDeltas`, `VesselId` | `getLevelCombatDeltas()` | All combat math now vessel-aware. Points per hit: baseline +1 × vessel modifier (Rebel: +2). Damage per miss: baseline 1 × vessel modifier (Rebel: 2). Timer decay: `1.5 × timerMultiplier` (Penitent: 0.85 = 15% slower). Miss forgiveness: every Nth miss absorbed (Shadow: every 3rd). Perfect level heal: zero-miss bonus (Penitent: +1 HP). `maxHealth` from vessel config (Penitent: 12, Rebel: 8, others: 10). |
| **DoorShell** | `getDoorCosts`, `getSecretDoorThreshold`, `VesselId` | `getDoorCosts()`, `getSecretDoorThreshold()` | Door costs now vessel-modified. Rebel: Dark doors cost `max(1, depth)` instead of `depth+1`, Light doors cost `depth+2`. Secret door condition changed from combined parity (`light+dark >= depth*2`) to dark-dominance (`dark - light >= threshold`), matching the lore (Rebel threshold: 2, default: 3). |
| **DropShell** | `shouldIncrementMetaCounter`, `VESSELS`, `VesselId` | `shouldIncrementMetaCounter()` | Meta progression now evaluates vessel-specific conditions on Drop. Penitent increments "Confessions" counter if `insight > 0`. Rebel increments "Breach" counter if `dark > light + 3`. Badge rendered when condition met. |

---

## Architecture Observations

### What Stayed in Shells (By Design)
The `vessels.ts` header comment explicitly states: *"Presentation layer (theology, sigils, SVGs, lore text) stays in SelectShell."* This boundary was respected. The refactored shells import only engine mechanics:
- `buildVesselPacketStats()` — identity data written to packet
- `getDraftPoolCounts()` — pool composition
- `getLevelCombatDeltas()` — combat math
- `getDoorCosts()` / `getSecretDoorThreshold()` — door economics
- `shouldIncrementMetaCounter()` — meta progression

**Fixed Moved SelectShellData to data/vessels/data.ts**SelectShell still owns: theology text, playstyle descriptions, SVG sigil strings, color hues, classification tags, asset IDs. This is correct — these are presentation concerns.

### The `@data` Alias Pattern
**Data has been prpmoted to a workspace**
The `data/` directory is not a workspace package. Rather than promoting it to a full pnpm workspace (which would require `package.json`, build config, exports map), we added a simple path alias. This is the lightest-touch approach:
- Vite resolves `@data/cards/pool` → `../../data/cards/pool.ts` at build time
- TypeScript resolves the same path for type checking
- No new workspace, no new build step, no barrel file needed

**Data has been prpmoted to a workspace**If `data/` grows significantly or needs to be consumed by `cli/` or `api/`, it should be promoted to a workspace package at that point.

### Remaining `any` Types
The `shuffle()` utility in `DraftOffering` still uses `any[]`. The `DraftApproach` component reads `runMeta?.insight` and `runMeta?.identity?.vessel` with optional chaining — these are properly typed on `RunMetaSnapshot` but the conditional vessel note logic uses string comparison, not a type guard. Low priority.

### Pre-existing Issue
**Fixed**
`TitlePage.tsx` has a pre-existing type error: `Module '"@du/phases"' has no exported member 'mountTitleScreen'`. This is unrelated to the refactoring — it existed before and is tracked in the title screen strategy decision (suggestions #5).

---

## Metrics

| Metric | Before | After |
|---|---|---|
| Data layer files | 2 (vessels.ts, types.ts) | 3 (+pool.ts) |
| Data layer LOC | 877 | 1,002 |
| Shell imports from `@data` | 0 | 5 shells, 10 imports |
| Inline card pool (DraftOffering) | 14 LOC of `cardPool` object | Deleted — imported from `pool.ts` |
| `any` types in Draft components | ~15 | ~3 (shuffle util, location.state cast) |
| Hardcoded combat math (LevelShell) | All inline | Vessel-aware via `getLevelCombatDeltas()` |
| Hardcoded door costs (DoorShell) | `depth + 1` for all | Vessel-modified via `getDoorCosts()` |
| Build status | ✅ (1 pre-existing error) | ✅ (same 1 pre-existing error) |
| Vite production build | ✅ | ✅ (343 KB gzipped: 107 KB) |

---

## What This Enables

1. **Vessel identity matters mechanically** — Choosing Rebel vs Penitent now produces meaningfully different gameplay across draft, level, door, and drop phases
2. **Data is portable** — `data/` directory has no React or web dependencies, ready for CLI/API consumers
3. **Cards are typed** — `DraftCard` schema with visibility manifests, keeper signals, vessel interactions, and reckoning comments replaces flat `{ id, name, effect }` objects
4. **Single source of truth** — Balance changes to vessel mechanics or card effects propagate to all shells from one edit in `vessels.ts` or `pool.ts`
