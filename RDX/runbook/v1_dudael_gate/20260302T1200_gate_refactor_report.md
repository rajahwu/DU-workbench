# GATE Refactor Report

**Timestamp:** 2026-03-02T12:00  
**Codename:** The Gate  
**Branch target:** `gate/refactor-selection-contract`  
**Status:** Complete — typecheck clean, build passes

---

## Summary

Executed the full GATE runbook: normalized the selection contract for the 3-layer Select flow (Guide → Mode → Vessel), added a packet builder, and updated all web consumers.

---

## Changes by File

### Engine Core (`phases/`)

| File | Change |
|---|---|
| `phases/types.ts` | Renamed `Selection` → `Choice<T>` (generic picker). Added `DescentGuide`, `DescentMode`, `VesselId` (engine-canonical lowercase). Added `GateSelection` composite type. Added `gate?: GateSelection` field to `PhasePacket`. Added `buildPacket()` helper function. Deprecated old `Selection` type (alias to `Choice<PlayerIdentity>`). |
| `phases/index.ts` | Barrel now exports `Choice`, `Selection`, `SelectionPool`, `DescentGuide`, `DescentMode`, `EngineVesselId`, `GateSelection`, and `buildPacket`. |
| `phases/manager.ts` | `applySideEffects` now reads `packet?.gate?.vesselId` as primary vessel source for identity lock (falls back to `identity?.vessel` → `player?.vessel`). |
| `phases/01_title/title.types.ts` | Re-exports expanded to include `Choice`, `Selection`, `GateSelection`, `DescentGuide`, `DescentMode`, `EngineVesselId`. |

### Web App (`web/react_app/`)

| File | Change |
|---|---|
| `src/app/phaseSlice.ts` | Replaced unsafe `as PhasePacket` cast with `buildPacket(from, to, packet)`. Imports `buildPacket` from `@du/phases`. |
| `src/features/SelectShell/index.tsx` | **Major rewrite.** Implements 3-step internal flow: Step 0 (Guide: light/dark) → Step 1 (Mode: steward/solo) → Step 2 (Vessel). Writes `GateSelection` to packet via `buildPacket`. Back navigation supported at each step. Vessel registry UI from step 2 unchanged. |
| `src/features/StagingShell/index.tsx` | Uses `buildPacket` instead of manual packet spread. Removed direct `PhasePacket` import. |
| `src/features/DoorShell/index.tsx` | Uses `buildPacket`. Fixed typo `"04_dr aft"` → `"04_draft"`. Removed direct `PhasePacket` import. |
| `src/features/LevelShell/index.tsx` | Uses `buildPacket` instead of manual packet spread. Removed direct `PhasePacket` import. |
| `src/features/DropShell/index.tsx` | Uses `buildPacket` instead of manual packet construction. Removed direct `PhasePacket` import. |

---

## Type Changes Detail

### New types added to `phases/types.ts`

```ts
type Choice<T> = { pool: SelectionPool<T>; chosen: T | null };
type DescentGuide = "light" | "dark";
type DescentMode  = "steward" | "solo";
type VesselId     = "seraph" | "shadow" | "exile" | "penitent" | "rebel";
type GateSelection = { guide?: DescentGuide; mode?: DescentMode; vesselId?: VesselId };
```

### `PhasePacket` new fields

```ts
gate?: GateSelection;        // canonical field for the 3-step Select
selection?: Selection;        // @deprecated — retained for compat
```

### `buildPacket` utility

```ts
function buildPacket(from: PhaseId, to: PhaseId, patch?: Partial<PhasePacket>): PhasePacket
```

Eliminates `as PhasePacket` casts across web layer. Always fills `from`, `to`, `ts`.

---

## Validation

| Check | Result |
|---|---|
| `pnpm -C web/react_app typecheck` | **Clean** — 0 errors |
| `pnpm -C web/react_app build` | **Pass** — 86 modules, 3.51s |
| `pnpm -C web/react_app lint` | **Skipped** — ESLint 9 config missing (pre-existing) |

---

## Known Caveats / Deferred Items

1. **`data/vessels/vessels.ts` uses `VesselId = 'SERAPH' | 'SHADOW' | ...`** (uppercase). Engine `types.ts` now has `VesselId` as lowercase. The data layer still uses its own uppercase `VesselId`. These coexist via the barrel alias `EngineVesselId`. A future unification pass should reconcile casing.

2. **`identity.vessel` in `RunMetaSnapshot`** still stores whatever string `lockIdentity()` receives (currently uppercase from SelectShell's `engineId.toUpperCase()`). Not changed — breaking the lock format mid-run would corrupt snapshots.

3. **`selection` field on `PhasePacket`** is deprecated but still written by `title-exchange.ts` (full/lite path). This will persist until `title-exchange` is updated to use `gate` instead.

4. **ESLint config** is missing (`eslint.config.js` for ESLint 9). Pre-existing issue, not caused by this refactor.

5. **Guide/Mode have no downstream effect yet.** The `gate.guide` and `gate.mode` values are written to the packet but no phase reads them yet. Draft pool bias and Staging behavior should eventually consume these.

6. **No Redux state for gate steps.** The 3-step flow uses local `useState` in SelectShell. If persistence across navigations is needed, this should move to the phase Redux slice.
