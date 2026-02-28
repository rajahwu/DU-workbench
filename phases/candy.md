🤣😂 yo **“kitten candy mechanic”** is *exactly* the kind of Dudael omen that belongs in the engine layer. And yes—slow is perfect. We’ll do this like a calm ritual, not a sprint.

From what you just said + the notebook pages, I think “kitten candy” is **the small, tempting reward** that appears at the *worst possible moment* (trapdoor candy). Mechanically: a **lure** that offers immediate Light (or comfort) but quietly increases Depth / Shadow / Drift… or flips a flag that changes the next phase.

So let’s define it clean, then wire it into your existing phase machine without rewriting the world.

---

## 1) Define “Kitten Candy” in engine terms

### It’s a *prompt* that can appear during phases

Title / Select / Door / Drop—anywhere you want the system to “leak.”

### It has:

* **Trigger conditions** (when it shows)
* **Offer** (what it promises)
* **Cost** (what it secretly does)
* **Choice** (take / refuse)
* **Persistence** (it should leave residue in meta state)

That’s it. It’s not UI first. It’s a rule.

---

## 2) Minimal data model (Redux-friendly)

Add this to your `game/types.ts` (or wherever your run-state lives):

```ts
export type CandyId = "kitten_candy";

export type CandyOffer = {
  id: CandyId;
  title: string;
  description: string;

  // what the player thinks they’re getting
  reward: { light: number };

  // what the system actually does
  cost: {
    shadow?: number;
    depthDelta?: number;      // increases descent depth
    drift?: number;           // increases “phantom bug” / confusion probability
    flags?: string[];         // marks that change future spawns
  };

  // where it can appear
  phaseAllowlist?: string[];  // e.g. ["01_title","02_select","06_door"]
};
```

Add this to state:

```ts
export type CandyState = {
  active?: CandyOffer;
  history: Array<{
    id: CandyId;
    taken: boolean;
    ts: number;
    phase: string;
  }>;
  // optional: spawn control
  cooldownUntilTs?: number;
};
```

Then your run state has:

```ts
candy: CandyState;
```

---

## 3) Spawn rule (simple, deterministic, creepy)

You want the candy to feel like an omen, not RNG confetti.

Here are three strong triggers—pick one now, add the others later:

### A) “First wake” trigger (once per run)

* Show candy the first time the player returns from Drop/Loop.

### B) “Edge pressure” trigger

* Show candy when Light is low *and* player hovers over Play / Confirm for >1.5s.

### C) “Drift” trigger (phantom bug alignment)

* If `drift > threshold`, candy appears in UI margins.

Minimal deterministic implementation:

```ts
export function shouldSpawnKittenCandy(args: {
  phase: string;
  light: number;
  shadow: number;
  depth: number;
  drift: number;
  now: number;
  cooldownUntilTs?: number;
  alreadySeen: boolean;
}) {
  const { phase, light, drift, now, cooldownUntilTs, alreadySeen } = args;

  if (cooldownUntilTs && now < cooldownUntilTs) return false;
  if (alreadySeen) return false;

  const phaseOk = phase === "01_title" || phase === "02_select" || phase === "06_door";
  if (!phaseOk) return false;

  // “Omen logic”: low light + high drift
  return light <= 1 && drift >= 1;
}
```

That makes it rare, meaningful, and *feels* like the abyss is “choosing moments.”

---

## 4) Taking it vs refusing it (this is the whole point)

### Take Candy:

* +Light now
* +Depth / +Shadow / +Drift later
* sets a flag: `"candy_taken"`

### Refuse Candy:

* No immediate reward
* reduces drift slightly
* sets a flag: `"candy_refused"` (which can become its own blessing later)

This turns your “don’t take the candy” meme into a *real* training mechanic:
**discipline creates future stability**.

---

## 5) Where it lives in your architecture

Based on your described DDD split:

* `data/` → `candy.ts` (static definition of offers)
* `game/systems/` → `candySystem.ts` (spawn + apply outcomes)
* `store/gameSlice.ts` → actions/reducers for `candy.spawn`, `candy.take`, `candy.refuse`
* `phases/*` → render overlay if `state.candy.active`

That means **state machine stays intact**. Candy is just a system that can inject an overlay.

---

## 6) UI: tiny and wicked (margin text + ash stroke)

Keep it subtle:

* a small glyph in the side bar
* fades in like the blood letters
* clickable “Take” / “Refuse” only appears on hover (or after 1 beat)

You don’t need new screens. Just a `CandyOverlay` component.

---

## 7) Tonight’s “go slow” build plan (3 commits)

### Commit 1 — Data + Types

* add `CandyOffer`, `CandyState`
* add `data/candy.ts` with the kitten candy definition

### Commit 2 — System + Reducer

* add `candySystem.ts` with `shouldSpawn` + `applyTake/applyRefuse`
* wire into gameSlice actions

### Commit 3 — Overlay

* simple overlay in Title or Select to prove loop works
* later you can make it creepy/beautiful

---

## First question (but you don’t have to answer long)

When you say **kitten candy mechanic**, do you want it to be:

1. **A literal kitten icon** offering candy (dark comedy), or
2. **A “kitten sneeze” omen** (no candy icon, just the system’s temptation prompt)?

If you tell me “literal” or “omen,” I’ll write the exact `data/candy.ts` definition + the `candySystem.ts` functions in your style and we can paste them straight into the repo.
