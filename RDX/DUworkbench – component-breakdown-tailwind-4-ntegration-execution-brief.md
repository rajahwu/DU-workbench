# DUDAEL Workbench – Component Breakdown & Tailwind 4 Integration: Execution Brief

## Current Baseline

The data-structure migration completed on 2026-03-04 landed cleanly. The app compiles and runs on the unified `PhaseWallPacket` architecture, with `runReducer` wired into the Redux store, a single canonical transition thunk at `app/requestTransition.ts`, and a converged `RunMetaSnapshot` schema in `phases/meta.ts`. All seven phases are routed and the Shell/Screen split established during the v2 UI FORGE runbook holds — no Screen or child component imports `useAppDispatch`, `requestTransition`, or `getRunMeta`.[^1][^2][^3]

Tailwind CSS 4 is already wired into Vite via `@tailwindcss/vite`, and `01_TITLE/TitleScreen.tsx` was fully migrated as the exemplar conversion. The remaining six phase Screen files still use per-phase `style.css` with raw color literals and inline styles.[^4][^3]

## What Remains: The Two Core Refactors

### 1. Component Breakdown

The goal is to keep Shells as orchestration-only while extracting reusable display/interaction blocks into composable components. The TODOs call for three shared primitives:[^4]

- **PhaseHeader** — top-bar equivalent used across phases
- **Parity indicator** — light/dark alignment display block
- **Action footer / button cluster** — the primary CTA row at the bottom of each phase[^5]

The recommended approach enforces the existing Shell vs. Screen contract: Shells own data selection, dispatch, and transitions; Screens and sub-components own rendering and callbacks only. Per-phase barrel exports should keep imports shallow from shell files.[^6]

Execution order starts with `01_TITLE` (already partially done via UI FORGE), then `02_SELECT` where `SelectScreen` is the largest single Screen file and should split into `GuidePicker`, `ModePicker`, and `VesselPicker` sub-components. After those two stabilize, the pattern propagates to `03_STAGING` through `07_DROP`.[^3]

### 2. Tailwind 4 Token Integration

Before touching any utility classes, a migration-safe token set must be defined first — mapping the current palette, spacing scale, and typography to Tailwind theme tokens with zero visual change. This is a critical sequencing call: converting to Tailwind *before* component extraction would spread mixed patterns across files and increase churn.

Phase conversion proceeds one phase at a time. Old CSS stays in place until each phase achieves verified pixel/behavior parity against the baseline. Raw color literals get replaced with theme tokens/utilities, and inline styles are reserved only for truly dynamic values.

For a React + Vite monorepo consuming Tailwind v4, ensuring all phase and component directories are included in the `@source` scan paths is essential to avoid purge misses.

## Recommended Execution Order

The reports and suggestions converge on a four-step sequence:

1. **Stabilize component boundaries** — extract view units with no behavior change.
2. **Introduce Tailwind tokens and utility mapping** — while preserving current visual output.
3. **Convert phase-by-phase** — `01_TITLE` → `02_SELECT` first, then expand outward.
4. **Delete/trim redundant CSS** — only after each converted phase matches baseline.

## Concrete Task Checklist

| Task | Category | Status |
|------|----------|--------|
| Inventory phase files by size/complexity, pick extraction order | Component | Not started
| Extract shared `PhaseHeader` (top-bar) | Component | Not started
| Extract shared parity indicator block | Component | Not started
| Extract shared action footer / button cluster | Component | Not started
| Refactor `01_TITLE` to shell-orchestration + pure presentational | Component | Not started
| Refactor `02_SELECT` — GuidePicker, ModePicker, VesselPicker | Component | Not started[^5][^3] |
| Define Tailwind token mapping (colors, spacing, typography) | Tailwind | Not started
| Add/verify TW4 config `@source` paths for all phase dirs | Tailwind | Not started
| Convert `01_TITLE` styles → utility classes + tokens | Tailwind | Not started (TitleScreen already done as exemplar)[^3] |
| Convert `02_SELECT` styles → utility classes + tokens | Tailwind | Not started
| Remove redundant CSS per phase after parity check | Tailwind | Blocked until conversion |
| Replace raw `localStorage` reads with `readActivePacket` (5 shells) | Hygiene | Not started[^9] |
| Resolve `src/components/indext.ts` typo | Hygiene | Done
| Update `web/builddocs/webapp-tree.md` — current vs target | Docs | Not started
| Audit docs for old transition references → `app/requestTransition.ts` | Docs | Not started

## Validation Gates

Each slice must pass before proceeding to the next phase conversion:[^5]

- `pnpm typecheck` passes after each phase conversion.
- `pnpm dev` launches and routes all seven phases.
- No regression in the transition path: title → select → staging → draft → level → door → drop → staging loop.

## Risks

- **Converting to Tailwind before extraction** spreads mixed class patterns and increases churn.
- **Global utility migration without token discipline** can introduce style regressions.
- **SelectScreen is the largest Screen** — extracting GuidePicker/ModePicker/VesselPicker touches the 3-step gate flow, so behavioral parity must be confirmed after split.

## After This: Testing the Look and Feel

Once the component breakdown and Tailwind integration land, the app will be in a position to iterate on visual polish without fighting architecture. The data layer is portable and typed, the Shell/Screen contract is clean, and the token system will give consistent design primitives across all seven phases. That makes "testing the look and feel" a matter of tuning token values, adjusting component compositions, and running the full loop — exactly the kind of rapid UI iteration this refactor is designed to unlock.

