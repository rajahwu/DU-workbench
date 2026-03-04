# TODOs — Data Structure Migration

- **Timestamp:** 2026-03-04T13:52
- **Status legend:** `[ ]` not started, `[~]` in progress, `[x]` done

## Completed in this migration

- [x] Wire `runReducer` into Redux store.
- [x] Use `PhaseWallPacket` as canonical transition request contract.
- [x] Migrate active phase shells to dispatch wall-based transitions.
- [x] Remove duplicate `meta.ts` state structures and keep one canonical shape.
- [x] Update boot recovery to new `history.phaseTrail` structure.
- [x] Pass app typecheck after migration.

## Next actionable TODOs

### Architecture

- [x] Persist `{ run, phase, wall }` checkpoint after each successful transition.
- [x] Hydrate both `runSlice` and `phaseSlice` from shared checkpoint on reload.
- [x] Replace `PhasePacket` boot event with wall-native boot event.
- [x] Remove legacy packet normalization bridge after migration completion.

### Contracts

- [x] Add a strict `(from,to) -> payload.kind` mapping utility and use in `buildWallPacket` callers.
- [x] Audit `manager.LEGAL` edges vs `PhaseWallPayload` kinds for complete parity.
- [x] Introduce schema versioning for `RunMetaSnapshot` persisted data.

### Gameplay data consistency

- [x] Feed real `levelResult` into drop summary instead of placeholder derivation.
- [x] Persist and display `lastDoorChoice`/`lastDropReason` from run ledger where useful.
- [x] Confirm alignment deltas are applied exactly once per loop edge.

### Quality

- [ ] Add transition integration tests covering all wall kinds and side-effects.
- [ ] Add regression test for identity lock irreversibility after `02_select -> 03_staging`.
- [ ] Add regression test for depth increment only on entry to `05_level`.
