# UI FORGE — Suggestions & TODOs
**Timestamp**: 2026-03-02T23:46
**Runbook**: v2 — UI FORGE

---

## Suggestions

### 1. Tailwind migration for remaining phases (High Priority)
SelectShell/style.css is 347 lines — the largest CSS file. Migrate one phase at a time following the TitleScreen exemplar. Suggested order: Select → Staging → Draft → Door → Drop → Level (Level last because its game HUD CSS is most complex).

### 2. Extract SelectScreen sub-components (High Priority)
SelectScreen is 260+ lines of JSX with 3 conditional renders (Guide/Mode/Vessel). Extract into `GuidePicker.tsx`, `ModePicker.tsx`, `VesselPicker.tsx` in a `components/` folder. SVG templates should move to a `sigils.ts` data file.

### 3. Replace raw localStorage reads with `readActivePacket()` (High Priority)
5 Shell files still manually do `JSON.parse(localStorage.getItem("dudael:active_packet"))`. The barrel already exports `readActivePacket()` from `boot.ts`. Quick 2-line changes per file.

### 4. Create `useSelectSteps` custom hook (Medium Priority)
SelectShell has gate step state, guide/mode/vessel handlers, and back navigation. Extract into a reusable hook: `useSelectSteps()` → returns `{ step, gate, handleGuide, handleMode, handleBack, handleLockVessel }`.

### 5. Add explicit prop types files (Medium Priority)
DraftShell now has `DraftShell.types.ts` for Outlet context. Consider similar files for other shells to keep prop contracts explicit and importable.

### 6. Shared Tailwind theme tokens (Medium Priority)
The codebase uses recurring hex colors: `#D4A843` (gold/light), `#7B4FA2` (purple/dark), `#C04050` (red/danger), `#6B8F71` (green/staging), `#8BA0B5` (blue/door), `#B8863B` (amber/drop), `#0D0E12` (bg), `#2A2D38` (muted). These should become Tailwind theme tokens in `tailwind.config.ts` or CSS custom properties in `index.css`.

### 7. Delete retired TitleShell/style.css (Low Priority)
The file is no longer imported after the Tailwind migration. Verify visually, then delete. The font import it contained (`JetBrains Mono`, `Crimson Pro`) should be moved to `index.html` or `index.css` if still needed globally.

---

## TODOs

- [ ] Migrate SelectShell CSS → Tailwind
- [ ] Migrate StagingShell CSS → Tailwind
- [ ] Migrate DraftShell CSS → Tailwind
- [ ] Migrate LevelShell CSS → Tailwind (most complex — game HUD)
- [ ] Migrate DoorShell CSS → Tailwind
- [ ] Migrate DropShell CSS → Tailwind
- [ ] Extract GuidePicker / ModePicker / VesselPicker from SelectScreen
- [ ] Extract SVG sigil templates to `data/vessels/sigils.ts`
- [ ] Replace 5 raw localStorage reads with `readActivePacket()`
- [ ] Create `useSelectSteps` custom hook
- [ ] Delete retired `TitleShell/style.css` after visual confirmation
- [ ] Add Tailwind theme tokens for recurring color values
- [ ] Set up Storybook stories for Screen components
- [ ] Add font imports to `index.css` (currently split across CSS files)
