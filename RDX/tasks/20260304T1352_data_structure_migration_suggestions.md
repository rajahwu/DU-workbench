# Suggestions — Data Structure Migration Follow-up

- **Timestamp:** 2026-03-04T13:52
- **Theme:** Hardening unified architecture after wall-packet + meta convergence.

## Priority A (quality hardening)

1. **Add transition integration tests**
   - Verify legal/illegal edges and side-effects for each wall kind.
   - Validate phase + run checkpoint consistency after successful transitions.

2. **Add one-way gate regressions**
   - Assert identity lock behavior after `02_select -> 03_staging`.
   - Assert depth increment only on entry to `05_level`.

3. **Add drop/gameplay regressions**
   - Assert `lastLevelResult`, `lastDoorChoice`, `lastDropReason` are reflected in Drop summary.
   - Assert forced drop path records `dropReason` deterministically.

## Priority B (state consistency)

4. **Keep run/meta ownership explicit**
   - Define ownership boundaries per field (engine-owned vs Redux-owned).
   - Guard against double-writes for alignment/depth in future features.

5. **Schema migration discipline**
   - Increment `schemaVersion` for snapshot shape changes.
   - Keep migration function backward-compatible for one version window.

## Priority C (cleanup)

6. **Document canonical flow in runbook**
   - One diagram + one sequence showing Shell → wall thunk → manager → meta/run updates.
