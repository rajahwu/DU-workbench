# TODOs — Core Refactors

- **Timestamp:** 2026-03-04T15:23
- **Status legend:** `[ ]` not started, `[~]` in progress, `[x]` done

## Component Breakdown

- [ ] Inventory current phase files by size/complexity and choose extraction order.
- [ ] Extract shared primitive: `PhaseHeader` equivalent for top bars.
- [ ] Extract shared primitive: parity indicator block.
- [ ] Extract shared primitive: action footer/button cluster.
- [ ] Refactor `01_TITLE` to shell-orchestration + pure presentational components.
- [ ] Refactor `02_SELECT` similarly (Guide/Mode/Vessel steps remain behaviorally identical).

## Tailwind 4 Integration

- [ ] Define Tailwind token mapping from existing colors/spacing/typography.
- [ ] Add/verify Tailwind 4 config paths for all phase/component directories.
- [ ] Convert `01_TITLE` styles from CSS/inline to utility classes + tokens.
- [ ] Convert `02_SELECT` styles from CSS/inline to utility classes + tokens.
- [ ] Remove redundant CSS for converted phases only after visual parity check.

## Fixes / Cleanup

- [x] Resolve `src/components/indext.ts` typo or dead file.
- [ ] Update `web/builddocs/webapp-tree.md` to distinguish current vs target structure.
- [ ] Audit docs for old transition references and point to `app/requestTransition.ts`.

## Validation (manual, no test additions yet)

- [ ] `pnpm typecheck` passes after each phase conversion slice.
- [ ] `pnpm dev` launches and routes all seven phases.
- [ ] Confirm no regression in transition path (`title -> select -> staging -> ...`).
