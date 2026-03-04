# Suggestions — Core Refactors (Component Breakdown + Tailwind 4)

- **Timestamp:** 2026-03-04T15:23

## Priority A — Component Breakdown

1. **Extract shared phase primitives**
   - Header/top-bar
   - parity display
   - action footer/button row
   - summary stat row/cards

2. **Enforce Shell vs Screen split**
   - Shell: data selection, dispatch, transition only.
   - Screen/components: rendering + callbacks only.

3. **Create per-phase component entrypoints**
   - Add local barrel exports in each phase directory.
   - Keep imports shallow from shell files.

## Priority B — Tailwind 4 Integration

4. **Define migration-safe token set first**
   - map current palette/spacing/type to Tailwind theme tokens.
   - no visual change in this step.

5. **Convert one phase at a time**
   - start with `01_TITLE`, then `02_SELECT`.
   - keep old CSS until each phase parity is verified.

6. **Reduce raw color literals**
   - replace inline color values with theme tokens/utilities.
   - reserve inline styles for dynamic values only.

## Priority C — Hygiene

7. **Fix likely typo module**
   - `src/components/indext.ts` → `index.ts` (or remove if unused).

8. **Refresh architecture docs**
   - split “target tree” vs “current tree” in `web/builddocs/webapp-tree.md`.

9. **Keep transition docs canonical**
   - reference `app/requestTransition.ts` as sole transition thunk.
