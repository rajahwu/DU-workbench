# Core Refactors EOD — Component Breakdown + Tailwind 4

- **Timestamp:** 2026-03-04T15:23
- **Scope:** Post data-migration planning and next execution path for the two remaining core refactors.
- **Status:** Planning/docs updated; implementation not started in this pass.

## Current Baseline

- Data-structure migration is complete and app is compiling/running.
- Transition contracts are wall-native and guarded by edge-kind validation.
- Shared checkpoint restore (`run + phase + wall`) is in place.

## Core Refactors (next)

### 1) Component Breakdown

Target outcome: phase shells stay orchestration-only while reusable display/interaction blocks are extracted into composable components.

Expected gains:
- Smaller files, easier reasoning and QA.
- Better feature velocity for UI iteration.
- Lower coupling between gameplay logic and presentational markup.

### 2) Tailwind 4 Integration

Target outcome: phase styling moves to tokenized Tailwind classes where appropriate, with legacy CSS reduced to edge-case/layout-specific rules.

Expected gains:
- Consistent design primitives.
- Lower CSS drift across phases.
- Faster implementation for future phase variants.

## Recommended Execution Order

1. **Stabilize component boundaries first** (extract view units with no behavior change).
2. **Introduce Tailwind tokens and utility mapping** while preserving visual output.
3. **Convert phase-by-phase** (`01_TITLE` + `02_SELECT` first), then expand.
4. **Delete/trim redundant CSS** only after each converted phase matches baseline.

## Quick Fixes Noted

- `web/react_app/src/components/indext.ts` appears to be a typo and likely should be renamed/merged as `index.ts`.
- `web/builddocs/webapp-tree.md` is currently aspirational and diverges from live structure; keep as “target architecture” or add a “current tree” section.
- Ensure docs now point to `app/requestTransition.ts` (canonical thunk) instead of old `phaseSlice.requestTransition(...)` wording.

## Risks

- Converting to Tailwind before component extraction may spread mixed patterns and increase churn.
- Global utility class migration without token discipline can introduce style regressions.

## Next Checkpoint Deliverables

- Refactor proposal PR (no visual changes): component extraction only.
- Tailwind 4 token map (colors/spacing/typography) aligned to current visual system.
- Phase conversion checklist with acceptance criteria (pixel/behavior parity).
