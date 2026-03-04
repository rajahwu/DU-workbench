# Data Structure Migration Report

- **Timestamp:** 2026-03-04T13:52
- **Scope:** Unified phase transition payload pattern, Redux run-state wiring, and engine meta-shape convergence.
- **Workspace:** `workbench/`

## Summary

This migration completed the three blockers called out in the update handoff:

1. Wired `runReducer` into the app store.
2. Standardized transition requests on `PhaseWallPacket` using a single thunk path.
3. Consolidated `phases/meta.ts` to one canonical `RunMetaSnapshot` shape and removed dual-state duplication.

Result: the app now operates on one architectural pattern for phase movement and one engine-side meta schema, removing the previous split between parallel transition/state systems.

## Implemented Changes

### 1) Store wiring

- Added `run: runReducer` to Redux store.
- File: `web/react_app/src/app/store.ts`

### 2) Transition convergence (`PhaseWallPacket` only)

- Kept `phaseSlice` as phase state/reducers/selectors.
- Made `app/requestTransition.ts` the canonical transition thunk:
  - Guards `fromPhase` against current phase.
  - Uses engine legality via `engineTransition(from, toPhase, wall)`.
  - Commits phase + wall to Redux.
  - Applies run side-effects (`recordPhase`, depth/drop/door bookkeeping).
- Migrated shells/dev paths to call `requestTransition(wall)`:
  - `01_TITLE/TitleShell.tsx`
  - `02_SELECT/SelectShell.tsx`
  - `03_STAGING/StagingShell.tsx`
  - `04_DRAFT/DraftLayout.tsx`
  - `05_LEVEL/LevelShell.tsx`
  - `06_DOOR/DoorShell.tsx`
  - `07_DROP/DropShell.tsx`
  - `components/DevTools/DevWalk.tsx`
  - `util/dev/boot-walk.ts`

### 3) Meta shape convergence

- Replaced duplicate/competing `meta.ts` structures with one `RunMetaSnapshot` state model.
- Unified snapshot persistence and hydration against one shape.
- Kept operational APIs: `initRunMeta`, `getRunMeta`, `restoreSnapshot`, `hydrateFromSnapshot`, `clearSnapshot`, `pushPhase`, `incDepth`, `incLoop`, `shiftAlignment`, `lockIdentity`, `addToInventory`, etc.
- Updated boot recovery to use `history.phaseTrail`.
- File: `phases/meta.ts`, `phases/boot.ts`

## Contract Updates

- Extended `PhaseWallPayload` to include live door paths used by shells/dev flow:
  - `door->draft`
  - `door->staging`
- Added corresponding wall payload types in `phases/types.ts`.
- Added legacy-compatible `id?: string` to `PlayerIdentity` to avoid breaking existing exchange/pool initialization call sites.

## Validation

- Command run: `pnpm typecheck` in `web/react_app/`
- Result: **pass**

## Risks / Notes

- Follow-up pass completed contract parity and gameplay summary wiring; Drop now reads persisted run-ledger outcomes.
- Boot bridge is now wall-native (`dudael:boot_wall`) and shared checkpoint hydration restores both run + phase slices.

## Recommended Next Slice

1. Add transition/side-effect integration tests for all wall kinds.
2. Add regression tests for one-way gates (`lockIdentity`) and depth increment rules.
3. Keep doc cleanup pass to remove outdated references to old packet-based transition guidance.
