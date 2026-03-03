
* **Do component breakdown + Tailwind first**
* **Do NOT touch Router actions/loaders or React Query yet**
* Keep agents runnable from CLI
* Add **reports** + **RDXT TODO extraction** as first-class outputs

---

# RitOps Agent Runbook v2 — DUDAEL “UI FORGE” Refactor

**Codename:** UI FORGE
**Goal:** Decompose components + migrate CSS → Tailwind **without** changing data-flow layers (Router loaders/actions, React Query).
**Primary Rules:** Shells own data; children are presentational. No new routes. No state re-architecture. Gate contract stays intact.

## 0) Mission Setup

```bash
cd ~/workbench/DU/workbench || exit 1
git status
git pull --rebase
pnpm -v
node -v
```

Create branch:

```bash
git checkout -b ui/forge-components-tailwind
```

---

## 1) Recon: establish a UI boundary + map current surfaces (NO CHANGES YET)

### 1.1 Locate Shell entrypoints + pages

```bash
rg -n "TitleShell|SelectShell|StagingShell|DraftShell|LevelShell|DoorShell|DropShell" web/react_app/src -S
rg -n "pages/|routes/|Route|createBrowserRouter|loader|action" web/react_app/src -S
```

### 1.2 Inventory styling approach (what exists today)

```bash
rg -n "\.module\.css|\.css\b|styled|className=" web/react_app/src -S
ls -R web/react_app/src | rg -n "\.css$|\.module\.css$"
```

### 1.3 RDXT / TODO sweep (create an “Ops TODO log”)

Run across repo (including RDX folders if present):

```bash
rg -n "RDXT|TODO\(RDXT\)|TODO:|FIXME:|HACK:|NOTE:" . -S
```

**Output requirement:** paste this into the PR under **“RDXT TODO log”** later.

---

## 2) UI Boundary Rule: enforce “Shell owns data”

This is the rule that prevents state hydra growth.

**Allowed in Shell components only:**

* `useSelector`, `useDispatch`, `requestTransition`, engine/meta selectors
* router hooks/data (but we aren’t adding loaders/actions yet)
* later: react-query hooks (NOT NOW)

**Child components must be:**

* presentational
* take props + callbacks
* no direct store access unless explicitly whitelisted

**Check violations:**

```bash
rg -n "useSelector|useDispatch|requestTransition|engineTransition" web/react_app/src -S
```

---

## 3) Component Breakdown (structure refactor, NOT logic refactor)

### 3.1 Pick the “Golden Path” order (recommended)

Refactor in this order so you can always run the game:

1. Title
2. Select (0/1/2 steps)
3. Staging
4. Draft
5. Level
6. Door
7. Drop

### 3.2 For each Shell, split into 3 layers

Target pattern (per phase):

* `Shell` (data + wiring)
* `Screen` (layout + orchestration, no store)
* `components/` (small UI pieces)

Example target folder shape:

```
web/react_app/src/phases/02_select/
  SelectShell.tsx        // store + dispatch only
  SelectScreen.tsx       // layout + step orchestration
  components/
    GuidePicker.tsx
    ModePicker.tsx
    VesselPicker.tsx
  hooks/
    useSelectSteps.ts
```

### 3.3 Mechanical extraction workflow (repeat per Shell)

1. **Copy** JSX into `*Screen.tsx`
2. Pass required data down via props
3. Ensure Shell still compiles and exports the route component
4. Keep logic stable: no behavior change yet

**Compile checkpoint after each phase:**

```bash
pnpm -C web/react_app typecheck
```

**Report requirement:** keep a running list:

* “Files moved/created”
* “Any behavior changes intentionally made” (ideally none)

---

## 4) CSS → Tailwind migration (translation, not redesign)

### 4.1 Tailwind readiness checks

Verify Tailwind is configured + working:

```bash
cat web/react_app/package.json | rg -n "tailwind|postcss|autoprefixer" -n
rg -n "tailwind.config|@tailwind" web/react_app -S
```

If Tailwind is already active: proceed.
If it’s partial: **do not overhaul config right now**—keep changes scoped to UI files.

### 4.2 Migration rule

* Migrate **one phase at a time**
* Keep old CSS files until that phase is fully migrated
* Remove dead classes only when the phase screen is verified

### 4.3 Phase-by-phase Tailwind workflow

For each phase folder:

1. Identify its CSS modules / files
2. Replace selectors with Tailwind utilities in the components
3. Delete/retire CSS only when you confirm the screen matches baseline

**Search helpers**

```bash
rg -n "\.module\.css" web/react_app/src -S
rg -n "className=\{[^}]*styles\." web/react_app/src -S
```

### 4.4 Visual sanity

Manual run after each phase:

```bash
pnpm -C web/react_app dev
```

Golden path check:

* Title renders
* Select 0/1/2 works
* Transition to Staging works
* No obvious layout explosions

---

## 5) Reports (required outputs)

This runbook always produces 3 reports for review/PR:

### 5.1 “Surface map”

Where each screen lives after refactor:

* Title: `...`
* Select: `...`
* etc.

### 5.2 “CSS retirement log”

List CSS files removed or kept:

* removed: …
* still used: …

### 5.3 “RDXT TODO log”

Paste the output of the TODO sweep from step 1.3, optionally grouped:

* build errors
* layout/styling notes
* future router/query work
* meta/packet followups

---

## 6) Validation

Run these at the end:

```bash
pnpm -r lint
pnpm -r typecheck
pnpm -r test || true
pnpm -C web/react_app dev
```

If anything fails, the agent must record:

* command
* error
* file(s) touched to fix
* whether it was a refactor regression or pre-existing

---

## 7) Commit Protocol (Cathedral-style)

Commit in slices. Suggested commit sequence:

```bash
git add -A
git commit -m "ui: split phase shells into screen/components"
```

Then Tailwind phase commits (one per screen ideally):

```bash
git add -A
git commit -m "ui: migrate select to tailwind"
git commit -m "ui: migrate staging to tailwind"
# etc
```

---

## 8) PR Notes (agent must write)

Include:

* What was refactored (component breakdown)
* What styling moved to Tailwind (phase list)
* What was explicitly *not* changed (router actions/loaders, react-query, state ownership)
* Reports (surface map, CSS retirement log, RDXT TODO log)
* Follow-ups for the next refactor phase

---

# Optional: Assignments by Agent (clean split)

### Claude — Architect (Structure)

* Define target folder layout
* Approve UI boundary rule
* Ensure extraction doesn’t leak store access into child components
* Write PR description skeleton

### Gemini — Ops / CLI (Execution)

* Do the actual file moves + renames
* Run typecheck checkpoints
* Maintain Surface map + CSS retirement log
* Paste RDXT TODO log

### You — Contract Cop / Final Pass

* Verify Gate selection flow still works
* Confirm no new routes
* Confirm “Shell owns data” rule held
* Decide what CSS gets deleted vs parked

---

## One-line prompt for agents (UI FORGE)

> **You are RitOps Agent UI FORGE.** Execute Runbook v2 (0–8) exactly. **Do not add routes, do not implement loaders/actions, do not introduce React Query, do not change state ownership.** Break shells into Screen/components, then migrate phase CSS to Tailwind one phase at a time. Produce: **Surface map + CSS retirement log + RDXT TODO log + validation results + PR-ready summary.**

