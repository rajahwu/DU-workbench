# Suggestions — Data Structure Migration Follow-up

- **Timestamp:** 2026-03-04T13:52
- **Theme:** Hardening unified architecture after wall-packet + meta convergence.

## Priority A (architecture hardening)

1. **Persist unified run checkpoints**
   - Write `{ run, phase, wall }` after each successful transition.
   - Recover both run slice and phase slice from same snapshot source.

2. **Deprecate legacy PhasePacket boot path**
   - Replace `dudael:boot_packet` payload with direct `PhaseWallPacket` event.
   - Remove normalize bridge once callers are migrated.

3. **Formalize transition payload coverage**
   - Ensure every legal edge in manager has an explicit wall payload type.
   - Add compile-time helper to map `(from,to)` to allowed `payload.kind`.

## Priority B (state consistency)

4. **Sync runSlice and engine meta intentionally**
   - Define ownership boundaries per field (engine-owned vs Redux-owned).
   - Add explicit hydration/reconciliation functions instead of ad hoc mirroring.

5. **Eliminate placeholder outcome state**
   - Feed real Level/Door outcomes into Drop summary and progression counters.
   - Remove synthetic defaults where gameplay data exists.

6. **Codify one-way gates**
   - Centralize irreversible transitions (`lockIdentity`, depth increment rules) in manager side-effects.
   - Add guard tests around illegal backward mutations.

## Priority C (safety + maintainability)

7. **Add transition integration tests**
   - Verify legal/illegal moves and side-effect updates for each wall kind.

8. **Add schema-versioned meta snapshot**
   - Store `schemaVersion` and migration handlers for future run-meta changes.

9. **Document canonical flow in runbook**
   - One diagram + one sequence showing Shell → wall thunk → manager → meta/run updates.
