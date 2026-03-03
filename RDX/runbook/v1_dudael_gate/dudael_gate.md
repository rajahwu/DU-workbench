# RitOps Agent Runbook — DUDAEL “GATE” Refactor

**Codename:** The Gate
**Goal:** Normalize contracts for the new 3-layer Select (Guide → Mode → Vessel), without a folder reorg.
**Primary rules:** engine owns types; web consumes; meta is canonical; packets are patches.

## 0) Mission Setup

```bash
cd ~/workbench/DU/workbench || exit 1
git status
git pull --rebase
pnpm -v
node -v
```

Create a branch:

```bash
git checkout -b gate/refactor-selection-contract
```

---

## 1) Recon: Map current type usage (NO CHANGES YET)

### 1.1 Find Selection + PhasePacket usage

```bash
rg -n "export type Selection\b|selection\?:" phases/types.ts web/react_app/src -S
rg -n "PhasePacket\b|requestTransition\b" phases web/react_app/src -S
rg -n "PlayerIdentity\b|identity\?\:" phases/types.ts web/react_app/src -S
```

### 1.2 Extract current PhasePacket + Selection definitions for review

```bash
sed -n '1,220p' phases/types.ts
```

### 1.3 Generate a quick “drift report”

```bash
rg -n "identity\." web/react_app/src -S
rg -n "player\." web/react_app/src -S
rg -n "selection\." web/react_app/src -S
```

Output should be pasted into the PR description later.

---

## 2) Contract Fix: Split “generic picker” vs “Gate selection”

### 2.1 Edit `phases/types.ts`

**Action:**

* Rename current `Selection` → `Choice<T>` (or `SelectionState<T>`)
* Add `DescentGuide`, `DescentMode`, `VesselId`
* Add `GateSelection`
* Update `PhasePacket.selection?: GateSelection`

Example target shapes:

```ts
export type Choice<T> = {
  pool: SelectionPool<T>;
  chosen: T | null;
};

export type DescentGuide = "light" | "dark";
export type DescentMode = "steward" | "solo";
export type VesselId = "seraph" | "shadow" | "exile" | "penitent" | "rebel";

export type GateSelection = {
  guide?: DescentGuide;
  mode?: DescentMode;
  vesselId?: VesselId;
};
```

Then:

```ts
selection?: GateSelection;
```

Optional but recommended:

* Deprecate `identity.vessel` (keep `sigil` if needed)

---

## 3) Web Update: Fix compile errors from renamed types

### 3.1 Find and replace old Selection references

```bash
rg -n "\bSelection\b" web/react_app/src -S
```

Update:

* Draft-related components keep using `SelectionPool<T>` and `Choice<T>` if needed
* Select phase UI now writes `GateSelection`

---

## 4) Select Sub-Phases wiring (Guide → Mode → Vessel)

### 4.1 Locate Select screen code

```bash
rg -n "02_select|SelectScreen|SelectShell" web/react_app/src -S
```

**Implementation rule:**

* No new routes.
* Keep `/02_select` phase.
* Add internal step state (0/1/2) OR store it in Redux if already doing that.
* Write selection patches:

  * step 0 → `{ selection: { guide } }`
  * step 1 → `{ selection: { ...prev, mode } }`
  * step 2 → `{ selection: { ...prev, vesselId } }` then transition to staging.

---

## 5) Packet Safety: stop “casting partial to full”

Your current thunk does:

```ts
({ ...packet, from, to, ts } as PhasePacket)
```

**RitOps recommended improvement (small):**

* Keep it, but add a local builder that always fills required fields:

```ts
function buildPacket(from: PhaseId, to: PhaseId, patch?: Partial<PhasePacket>): PhasePacket {
  return {
    from,
    to,
    ts: Date.now(),
    ...patch,
  };
}
```

Then:

```ts
const fullPacket = buildPacket(from, to, packet);
```

This doesn’t fix all drift, but it eliminates the worst “undefined required fields” cases.

---

## 6) Validation: build + typecheck + run

```bash
pnpm -r lint
pnpm -r typecheck
pnpm -r test || true
pnpm -C web/react_app dev
```

Do a quick manual:

* Title → Select step 0,1,2 → Staging
* Confirm selection persists through the run

---

## 7) Commit Protocol (Cathedral-style)

```bash
git add -A
git commit -m "gate: normalize selection contract (guide/mode/vesselId)"
```

If there are follow-ups:

```bash
git commit -m "select: implement 3-step selection flow"
git commit -m "web: harden packet builder in requestTransition"
```

---

## 8) PR Notes (what the agent must write)

Include:

* What types changed (Selection → Choice, GateSelection added)
* What files updated in web
* Any known follow-ups (BoundState persistence, meta updates in Drop)

---

# Optional: Assignments by Agent

If you want to split work:

### Claude (Architect)

* types.ts refactor plan + PR description
* ensures semantics match Gate brief

### Gemini (Ops / CLI)

* executes grep/replacements
* fixes compile errors
* runs pnpm checks and notes failures

### Me (Contract Cop)

* final pass on `PhasePacket`, `GateSelection`, ID casing
* ensures Draft picker remains intact

