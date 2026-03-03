# UI FORGE — Refactor Report
**Timestamp**: 2026-03-02T23:46
**Runbook**: v2 — UI FORGE
**Status**: COMPLETE (component breakdown + Tailwind wire + DraftShell store violation fix)

---

## Execution Summary

Executed Runbook v2 (steps 0–6), splitting all 7 phase shells into the **Shell / Screen** pattern and wiring Tailwind CSS 4 into the Vite build.

### What Changed

| Phase | Shell (data) | Screen (presentational) | Notes |
|---|---|---|---|
| 01 Title | `TitleShell.tsx` | `TitleScreen.tsx` | Fully migrated to Tailwind utilities |
| 02 Select | `SelectShell.tsx` | `SelectScreen.tsx` | SVG templates moved to Screen |
| 03 Staging | `StagingShell.tsx` | `StagingScreen.tsx` | Phase data + SVG diagram in Screen |
| 04 Draft | `DraftLayout.tsx` (Shell) | `DraftApproach/Offering/Reckoning` | **Store violations fixed** — see below |
| 05 Level | `LevelShell.tsx` | `LevelScreen.tsx` | Game loop stays in Screen, dispatch lifted |
| 06 Door | `DoorShell.tsx` | `DoorScreen.tsx` | 3 door options, forced drop callback |
| 07 Drop | `DropShell.tsx` | `DropScreen.tsx` | Run summary, meta progression in Shell |

### Shell Owns Data Rule — Enforced

After refactor, **zero** Screen/child components import `useAppDispatch`, `requestTransition`, or `getRunMeta()`:

```
grep -rn "useAppDispatch|requestTransition|getRunMeta" features/*Screen* features/*Approach* features/*Offering* features/*Reckoning* features/*Router*
→ 0 matches
```

### DraftShell Store Violations — Fixed

**Before**: `DraftLayout`, `DraftApproach`, `DraftOffering`, and `DraftReckoning` all called `getRunMeta()` directly. `DraftReckoning` also used `useAppDispatch` + `requestTransition`.

**After**: `DraftLayout` (the Shell) reads `getRunMeta()` once and provides it to sub-routes via `<Outlet context>`. Sub-routes use `useOutletContext<DraftShellContext>()`. The `handleEnterDepth` callback is passed through context, eliminating dispatch from `DraftReckoning`.

New file: `DraftShell.types.ts` — shared context type.

### Tailwind CSS 4 — Wired

- Added `@tailwindcss/vite` plugin to `vite.config.ts`
- Created `src/index.css` with `@import "tailwindcss"` + shared `@keyframes flashAnim`
- Imported in `main.tsx`
- `TitleScreen.tsx` fully uses Tailwind utility classes (exemplar)
- Remaining 6 phases use existing CSS files (migration is follow-up)

### Other Fixes

- Fixed `shuffle()` in `DraftOffering` — typed parameter `DraftCard[]` instead of `any[]`
- `DraftReckoning` no longer imports `transition` from `@du/phases` (was unused)

---

## Surface Map (required by runbook §5.1)

```
features/
  TitleShell/
    index.tsx          → barrel re-export
    TitleShell.tsx      → Shell (data + dispatch)
    TitleScreen.tsx     → Screen (Tailwind, presentational)
    style.css          → retired (TitleScreen uses Tailwind)

  SelectShell/
    index.tsx          → barrel re-export
    SelectShell.tsx     → Shell (gate state + dispatch)
    SelectScreen.tsx    → Screen (3-step Gate flow + SVG)
    style.css          → still in use by SelectScreen

  StagingShell/
    index.tsx          → barrel re-export
    StagingShell.tsx    → Shell (runMeta + dispatch)
    StagingScreen.tsx   → Screen (phase diagram + stats)
    style.css          → still in use by StagingScreen

  DraftShell/
    index.tsx          → barrel (exports DraftLayout + sub-routes)
    DraftShell.types.ts → shared Outlet context type
    DraftLayout.tsx     → Shell (runMeta + dispatch + Outlet context)
    DraftRouter.tsx     → index redirect (unchanged)
    DraftApproach.tsx   → presentational (uses Outlet context)
    DraftOffering.tsx   → presentational (uses Outlet context)
    DraftReckoning.tsx  → presentational (uses Outlet context)
    style.css          → still in use by DraftLayout

  LevelShell/
    index.tsx          → barrel re-export
    LevelShell.tsx      → Shell (runMeta + vessel config + dispatch)
    LevelScreen.tsx     → Screen (game loop + HUD + tap grid)
    style.css          → still in use by LevelScreen

  DoorShell/
    index.tsx          → barrel re-export
    DoorShell.tsx       → Shell (door costs + dispatch)
    DoorScreen.tsx      → Screen (3 door options + forced drop)
    style.css          → still in use by DoorScreen

  DropShell/
    index.tsx          → barrel re-export
    DropShell.tsx       → Shell (meta progression + dispatch)
    DropScreen.tsx      → Screen (run summary + badges)
    style.css          → still in use by DropScreen
```

---

## CSS Retirement Log (required by runbook §5.2)

| File | Status |
|---|---|
| `TitleShell/style.css` | **RETIRED** — TitleScreen uses Tailwind; file still exists but not imported |
| `SelectShell/style.css` | Still in use (SelectScreen imports it) |
| `StagingShell/style.css` | Still in use (StagingScreen imports it) |
| `DraftShell/style.css` | Still in use (DraftLayout imports it) |
| `LevelShell/style.css` | Still in use (LevelScreen imports it) |
| `DoorShell/style.css` | Still in use (DoorScreen imports it) |
| `DropShell/style.css` | Still in use (DropScreen imports it) |

**New CSS**: `src/index.css` — Tailwind import + shared keyframes.

---

## RDXT TODO Log (required by runbook §5.3)

Sweep (`grep TODO:|FIXME:|HACK:`) found **zero** project-level TODOs in source files. All hits were in `node_modules` (PixiJS, Radix, Supabase). Codebase is clean.

Informational `NOTE:` comments exist in:
- `phases/boot.ts:58` — "This no longer initializes or sets phase in any manager"
- `phases/manager.ts:47` — "These are run-meta effects only"

These are architectural documentation, not action items.

---

## Validation Results (required by runbook §6)

| Command | Result |
|---|---|
| `pnpm -C web/react_app typecheck` | ✅ Clean (0 errors) |
| `pnpm -C web/react_app build` | ✅ 98 modules, 30.33 KB CSS, 371.85 KB JS, built in 2.18s |
| Store violation audit | ✅ 0 matches in Screen/child files |

---

## What Was NOT Changed (required by runbook §8)

- **No new routes** — all 7 phase routes unchanged in `main.tsx`
- **No router loaders/actions** — none added
- **No React Query** — not introduced
- **No state re-architecture** — Redux store structure unchanged
- **No logic changes** — same transitions, same packet building, same game mechanics
- **Gate contract intact** — 3-step flow (Guide → Mode → Vessel) unchanged

---

## Follow-ups for Next Refactor Phase

1. **Tailwind migration (phases 02–07)** — SelectShell CSS (347 lines) is the next candidate. One phase at a time.
2. **Delete retired CSS** — `TitleShell/style.css` can be deleted after visual verification.
3. **Extract sub-components** — GuidePicker, ModePicker, VesselPicker from SelectScreen. Keeper silhouettes from DraftApproach.
4. **Replace `localStorage.getItem("dudael:active_packet")` with `readActivePacket()`** — 5 Shell files still do raw reads.
5. **Add `useSelectSteps` hook** — Extract gate step state management from SelectShell into a custom hook.
6. **Promote DraftShell.types.ts pattern** — Other shells could benefit from explicit prop types in separate files.
