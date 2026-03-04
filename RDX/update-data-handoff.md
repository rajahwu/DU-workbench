# RDX Handoff — Current State (2026-03-04)

## Status

- Web app runs and compiles on current migration branch.
- Phase movement is unified on `PhaseWallPacket`.
- Redux and engine meta now follow one coordinated architecture.

## Canonical Flow

1. Shell builds a wall payload with `buildWallPacketForEdge(from, to, payload)`.
2. Shell dispatches `requestTransition(wall)` from `web/react_app/src/app/requestTransition.ts`.
3. Thunk validates `fromPhase`, calls `engineTransition(from, to, wall)`, applies run-side effects, commits phase/wall, and persists checkpoint.
4. Checkpoint writes `{ run, phase, wall }` to localStorage key `dudael:run_phase_wall`.

## Source of Truth

- **Transition legality + engine side effects**: `phases/manager.ts`
- **Wall contracts + edge/kind guard**: `phases/types.ts`
- **Engine run snapshot + schema migration**: `phases/meta.ts`
- **UI phase state**: `web/react_app/src/app/phaseSlice.ts`
- **Persistent run ledger**: `web/react_app/src/app/runSlice.ts`
- **Transition thunk**: `web/react_app/src/app/requestTransition.ts`
- **Checkpoint persistence**: `web/react_app/src/app/checkpoint.ts`

## Boot + Recovery

- Boot now emits **wall-native** event: `dudael:boot_wall` from `phases/boot.ts`.
- React bridge listens in `components/DevTools/DevWalk.tsx` via `BootWallBridge`.
- Startup hydration restores both slices from shared checkpoint in `web/react_app/src/main.tsx`.

## Gameplay Data Wiring (current)

- Level completion writes real result to run ledger via `recordLevelResult`.
- Door/drop path writes `lastDoorChoice` and `lastDropReason`.
- Drop summary renders from run ledger, no placeholder-only path.

## Completed Migration Items

- `runReducer` mounted in store.
- Legacy packet normalization bridge removed from active flow.
- Contract parity audited against `manager.LEGAL` edges.
- Meta snapshot is schema-versioned and migration-safe.

## Remaining TODO Scope

- Add transition/side-effect tests (not started by request).
- Optional: centralize alignment mutation ownership strictly in one layer if future drift appears.
- Optional: prune old comments/docs that still mention `phaseSlice.requestTransition(...)`.
