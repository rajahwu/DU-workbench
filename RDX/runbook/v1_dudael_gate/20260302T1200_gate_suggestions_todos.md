# GATE Refactor — Suggestions & TODOs

**Date:** 2026-03-02  
**Context:** Post-GATE refactor. Selection contract normalized. 3-step Select flow live.

---

## Runbook Suggestions

### 1. Add ESLint 9 Config

The `pnpm lint` command is broken project-wide. ESLint 9 requires `eslint.config.js` (flat config).

**Suggested runbook step:**
```bash
# In web/react_app/
npx @eslint/migrate-config .eslintrc.*
# Then verify with: pnpm lint
```

Priority: **High** — blocks CI lint gate.

### 2. Reconcile VesselId Casing

Two `VesselId` types exist:
- `phases/types.ts` → lowercase: `"seraph" | "shadow" | ...`
- `data/vessels/vessels.ts` → uppercase: `"SERAPH" | "SHADOW" | ...`

**Recommendation:** Unify to lowercase in `data/vessels/` and update all consumers. The engine type is canonical. Add a runbook step that does a case-insensitive search-and-replace across `data/` and shell components.

Priority: **Medium** — works now via `.toUpperCase()` bridge but adds conversion noise.

### 3. Wire `gate.guide` and `gate.mode` Downstream

These values are now written to the packet but not consumed. Next steps:

| Consumer | Expected Behavior |
|---|---|
| `DraftShell` → `DraftOffering` | `gate.guide` should bias the draft pool (light guide → more Light cards offered) |
| `StagingShell` | `gate.mode === "steward"` could show tutorial/guidance UI |
| `meta.ts` → `RunMetaSnapshot` | Consider storing `guide` and `mode` in snapshot for display in later phases |

Priority: **Medium** — design decision needed on how guide/mode affect gameplay.

### 4. Migrate `title-exchange.ts` Away from Deprecated `selection`

`title-exchange.ts` still writes `selection: { pool, chosen }` to the packet. This should be updated to write `gate` instead, or the title phase should stop writing selection entirely (it's not consumed downstream).

Priority: **Low** — deprecated field is ignored; no runtime impact.

### 5. Move Gate Steps to Redux

Currently the 3-step flow in SelectShell uses local `useState`. If the user navigates away and back (e.g., browser back button), state is lost. Consider adding a `gateSelection` slice to Redux or storing partial gate state in `sessionStorage`.

Priority: **Low** — only matters if navigation persistence is desired at Select.

### 6. Add Automated Tests for Transition + Gate

No tests exist for the phase transition logic. A Vitest suite covering:
- Legal transitions with `GateSelection` in packet
- `buildPacket` output shape
- `lockIdentity` reading `gate.vesselId` correctly

Would catch regressions from future type changes.

Priority: **High** — engine layer has no test coverage.

---

## TODOs

### Immediate (this sprint)

- [ ] Create `eslint.config.js` for `web/react_app` (ESLint 9 flat config)
- [ ] Add Vitest tests for `transition()` with `gate` field
- [ ] Add Vitest tests for `buildPacket()`
- [ ] Smoke test the full loop manually: Title → Select (Guide → Mode → Vessel) → Staging → Draft → Level → Door → Drop → Staging

### Next Sprint

- [ ] Unify `VesselId` casing: engine lowercase as canonical, data layer migrated
- [ ] Wire `gate.guide` into `DraftOffering` pool bias logic
- [ ] Wire `gate.mode` into `StagingShell` (steward shows guidance, solo does not)
- [ ] Add `guide` and `mode` fields to `RunMetaSnapshot` for display in later phases
- [ ] Update `title-exchange.ts` to stop writing deprecated `selection` field
- [ ] Consider persisting partial `GateSelection` to Redux or sessionStorage

### Backlog

- [ ] Remove deprecated `Selection` type once all serialized packets are rotated
- [ ] Add animation transitions between Gate steps (Guide → Mode → Vessel)
- [ ] Add keyboard navigation for Gate step selection (accessibility)
- [ ] Document the 3-layer Gate contract in `game/docs/`
- [ ] Add Storybook stories for each Gate step screen
