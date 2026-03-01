**DUDAEL**

*The Drop*

Complete Design Reference

Sinerine  ·  Radiant Seven Ecosystem  ·  V-00

# **I. PHASE STATE MACHINE**

*Source of truth for the Redux GamePhase enum. Every phase transition must match these states and events exactly.*

| STATE | SCREEN NAME | ENTRY EVENT | NOTES |
| :---- | :---- | :---- | :---- |
| TITLE | Enter Dudael | App load / Return to Staging | Redux store warm: user (guest), settings, identity, local storage. \#0D0E12 background. |
| CHARACTER\_SELECT | Choose Vessel | "Start / Exchange" | Vessel determines: starting Light/Dark, health, hand size, draft bias. Lock Vessel → Penitent reading lore → Insight. Five sigils: Seraph, Shadow, Exile, Penitent, Rebel. |
| STAGING | Locker Room | "Lock Vessel" | Vessel, depth, loops, parity meters displayed. Engine \+ COD2 panels. Lore stack (codex). Penitent: 2–3 seconds reading → \+1 Insight (cap 3). Rebel: Dark \> 3 → Instability shown. Initiate Draft button. |
| CARD\_DRAFT | Light & Dark Guides | "Initiate Draft" | Surveyor (Light) \+ Smuggler (Dark) child guides. Cards condense, grid materializes (\~500ms slide). Draft shapes next Level difficulty. Insight counter active for Penitent. |
| LEVEL\_PLAY | The Descent | "Cards Picked" | Timer bar \+ Light/Dark bar. Grid mini-game container. Rebel \= glass cannon. Penitent \= endurance. Grid fades → three doors rise from bottom on success. Grid cracks → red flash → spiral fall on death/timeout. |
| DOOR | Three Paths | "Level Complete" | Three doors: Light (white), Dark (dark), Secret (purple — appears at parity extreme). Door costs scale by depth. DOOR → STAGING \+ depth increment on pass. |
| DROP | Dudael Drop | "Door Failed" or death | \~800ms spiral \+ \~300ms fade. Run Summary: Vessel, Depth reached, Points, Final parity, Confessions \+1, Breach \+1. Unlocked lore card shown. Return to Staging → locker room richer. |

### **Transition Animations (from screen map)**

| FROM | TO | ANIMATION |
| :---- | :---- | :---- |
| TITLE | CHARACTER\_SELECT | Hard cut, forensic reveal, \~300ms fade |
| CHARACTER\_SELECT | STAGING | Slide transition, vessel carries forward, \~500ms slide |
| STAGING | CARD\_DRAFT | Cards condense, grid materializes, \~500ms slide → Fade to center, guides emerge, \~300ms fade |
| CARD\_DRAFT | LEVEL\_PLAY | Grid fades → three doors rise from bottom (success). Grid cracks → red flash → spiral fall (death) |
| LEVEL\_PLAY | DOOR | Door opens, light wash, \~800ms spiral, \~300ms fade |
| DOOR/DROP | STAGING | Fade up, locker room richer (meta counters written) |

# **II. STATE FLOW & DATA PIPELINE**

*The packet structure evolves as the run progresses. Redux state is source of truth for current run numbers. Packet is forwarded via localStorage between phases.*

## **Packet Evolution**

| PHASE | PACKET SHAPE | NOTES |
| :---- | :---- | :---- |
| TITLE | { ts, user: { id, kind }, from, to } | Initial packet. Guest user until authenticated. |
| After SELECT | { ...packet, player: { vessel, stats }, instability? } | Vessel locked. Stats initialized: Light, Dark, health, maxHealth, hand size. |
| After DRAFT | { ...packet, meta: { draftedCards, paritySnapshot } } | Cards written to packet. Parity snapshot recorded here — checked again at Door. |
| After LEVEL | { ...packet, meta: { ...meta, levelResult } } | Health decremented, points incremented, Light/Dark adjusted from hits. |
| After DOOR | { ...packet, meta: { ...meta, doorChoice } } | Door choice recorded. Light or Dark decremented as cost. |
| After DROP | Packet resets to SELECT \+ loopCount | Meta counters → localStorage. Insight/Instability calculated on-the-fly, not stored long-term. |

## **Redux State Mutations Per Phase**

| PHASE | REDUX READS | REDUX WRITES |
| :---- | :---- | :---- |
| SELECT | Vessel registry, starting stats config | Initialize vessel, Light, Dark, health, maxHealth |
| DRAFT | vessel.draftBias, insight level, card pool | Increment Light/Dark from card picks. Write packet picks. |
| LEVEL | Current Light/Dark, health, drafted cards | Decrement health, increment points, adjust Light/Dark from hits |
| DOOR | Parity snapshot (from Draft), door costs by depth | Decrement Light or Dark (cost), increment depth |
| DROP | Full run state | Reset to starting values, increment loopCount. Meta counters to localStorage. |

### **Key Architectural Decisions**

* Insight and Instability are calculated on-the-fly from current run behavior — not stored long-term. They are derived state, not persisted state.

* Parity snapshot is taken at the end of CARD\_DRAFT and checked again at DOOR. The gap between snapshot and door choice creates tension.

* Meta counters (Confessions, Breach, loopCount, unlocked lore) persist across runs in localStorage.

* Draft bias: Light vessel → 3 Light : 1 Dark cards in pool. Dark vessel → 1 Light : 2 Dark cards.

# **III. VESSEL CLASSES**

*Each vessel determines starting stats, draft bias, and unique mechanic behavior throughout the run.*

| VESSEL | ARCHETYPE | STAT PROFILE | UNIQUE MECHANIC |
| :---- | :---- | :---- | :---- |
| Seraph | Highest order | High Light, Low Dark | Root-Whisper Stability cost doubled. Proximity to Light before the fall means the Dark voices are most destabilizing. Sees card lore with theological depth. |
| Shadow | Concealment | Balanced, high Stealth | Absorbs Risk cards — Stability cost negated on CORRUPTION cards. Moves through Dudael via absence rather than force. |
| Exile | Cast out | Balanced | Was removed, not fallen. Creates distinct relationship to the zone. Mechanics TBD — distinct from both choice-based and slip-based vessels. |
| Penitent | Seeking | High Endurance, moderate stats | Reading lore in Staging → \+1 Insight (cap 3, \~2–3 seconds per entry). Insight drives card visibility. Confessions \+1 on drop when Light \> 1\. Endurance mechanic in Level Play. |
| Rebel | Chose the fall | High risk/reward, glass cannon | Dark \> Light+3 → Instability visual appears, cheaper Dark doors. Breach \+1 on drop when Dark \> Light+3. High reward and high failure risk. May have Insight penalties. |

# **IV. SYSTEMS MAP — LIGHT, DARK & META-PROGRESSION**

*Causal loop diagram. R \= Reinforcing loop (compounds over time). B \= Balancing loop (self-correcting). \+ \= increases, \- \= decreases.*

## **Core Variables**

| VARIABLE | DESCRIPTION |
| :---- | :---- |
| Light Parity | Current Light accumulation. Drives door access, draft pool composition, parity balance. |
| Dark Parity | Current Dark accumulation. Drives instability, secret doors, breach unlocks. |
| Parity Balance | Ratio of Light to Dark. Determines door costs, success probability, secret threshold. |
| Depth Level | Current descent depth. Scales door costs and success probability. Resets on DROP. |
| Insight (Penitent) | 0–3. Derived from lore reading behavior. Controls card visibility in Draft. |
| Instability (Rebel) | Triggered when Dark \> Light+3. Visual indicator. Enables cheaper Dark doors, higher risk. |
| Draft Pool Composition | Light/Dark card ratio in pool. Driven by vessel bias and parity state. |
| Card Visibility | How much mechanical info the player sees per card. Controlled by Insight. |
| Door Costs | Light or Dark required to pass a door. Scales with depth. |
| Success Probability | Likelihood of door pass. Affected by parity balance, depth, and vessel. |
| Secret Threshold | Parity extreme that unlocks the Secret door (purple). High Dark bias required. |

## **Reinforcing Loops (compound over time)**

### **R1 — The Lore Loop**

* Reading Lore in Staging → \+Insight

* Insight → \+Card Visibility → Better card picks

* Better picks → \+Light Parity → \+Door Success

* Door success → \+Depth → More lore available → More reading

*Primary progression loop for Penitent. Rewards engagement with the codex. Self-reinforcing across runs as Staging Area richness grows.*

### **R2 — The Dark Spiral**

* High Dark → \+Instability

* Instability → \+Secret Doors available → \+Breach Unlocks

* Breach unlocks → \+Dark cards in pool → Encourages more Dark

*Primary progression loop for Rebel. High risk, high reward. Self-reinforcing but also drives toward DROP faster. Breach counter persists across runs.*

### **R3 — The Meta Loop**

* Failed runs → \+Meta counters (Confessions, Breach)

* Meta counters → \+Starting Knowledge

* Starting knowledge → Better early choices → Better run outcomes

*Cross-run progression. Death is not a reset — it contributes. The locker room fills. The Staging Area gets richer.*

## **Balancing Loops (self-correcting)**

### **B1 — Depth Cost Escalation**

* \+Depth → \+Door Costs → \-Success Rate → DROP → Reset Depth

* DROP → \-Instability Bonuses → \-Reward Spikes

*Prevents infinite depth runs. The deeper you go, the harder it gets. Eventually the system resets.*

### **B2 — Light Parity Correction**

* \+Light Parity → \-Dark Cards in Draft Pool

* Fewer Dark cards → Slower Dark accumulation → Parity stabilizes

*Light-biased players get fewer Dark options over time. The system nudges toward balance.*

### **B3 — Dark Parity Cost**

* \+Dark Parity → Expensive Light Doors → Forces Dark Path → \+Risk

*Dark-biased players find Light doors increasingly costly. They're locked into the darker path — higher reward, higher failure risk.*

## **Draft Pool Composition Rules**

| CONDITION | SURVEYOR (LIGHT) CARDS | SMUGGLER (DARK) CARDS |
| :---- | :---- | :---- |
| Light vessel selected | 3 cards | 1 card |
| Dark vessel selected | 1 card | 2 cards |
| Balanced / default | 2 cards | 2 cards |
| Instability active (Rebel) | 1 card | 3 cards |

## **Meta-Progression Counters**

| COUNTER | TRIGGER | EFFECT |
| :---- | :---- | :---- |
| Confessions | Penitent: Insight \> 0 when Light \> 1 at DROP | Persists in localStorage. Unlocks lore entries. Enriches Staging Area on return. |
| Breach | Rebel: Dark \> Light+3 at DROP | Persists in localStorage. Unlocks dark lore, Breach-specific cards. Encourages deeper Dark runs. |
| Loop Count | Every DROP → Return to Staging | Tracks total runs. Staging Area richness scales with loopCount. |
| Codex Entries | Lore read \+ drop survival | Unlocked entries available in Staging on future runs. |

# **V. CARD SYSTEM SUMMARY**

*Full TypeScript schema: game-lore/src/types/card.types.ts*

## **Card Visibility by Insight Level**

| INSIGHT | LABEL | VISIBLE FIELDS |
| :---- | :---- | :---- |
| 0 | No lore read | Name, Keeper attribution, Lore text, Quote. Pure narrative choice — pick based on vibes and theology. |
| 1 | Some lore | \+ Primary delta (dominant Light ☀ or Dark ◆ icon \+ number). Math visible, still mysterious about costs. |
| 2 | Moderate lore | \+ Secondary deltas \+ Effect summary strip. Full economy visible. Can make informed parity decisions. |
| 3 | Deep lore | \+ Tags (STABILITY, RISK, etc.) \+ Strategic hint \+ Quote attribution \+ Vessel interaction. Theory-craft builds. |
| Unlocked | Condition met | Additional mechanic revealed. Requires: lore\_entry, vessel\_depth, keeper\_favor, run\_count, card\_history, or parity\_extreme. |

## **Card Tags**

| TAG | MEANING |
| :---- | :---- |
| STABILITY | Reduces door volatility at high depths. Hidden until Insight 2+. |
| RISK | Carries a negative mechanic. Hidden until Insight 3 — the Smuggler does not warn you. |
| SANCTIFIED | Light-aligned bonus. Interacts with Seraph and Penitent vessels. |
| CORRUPTION | Dark-aligned cost. Interacts with Shadow and Rebel vessels. |
| SEALED | Card effect partially locked until unlock condition met. |
| RELIC | Ancient artifact. Dark cards from before the fall. High power, high cost. |
| THRESHOLD | Triggers special behavior at parity extremes. |
| ECHO | Carries an effect forward to the next depth. |

## **Draft Sub-Phase Sequence (4A → 4B → 4C)**

**4A — Approach:** Keeper introduction. Keeper dialogue reflects pool contents via keeperSignal. Player sees parity state and vessel alignment reminder. No action — ceremonial space.

**4B — Offering:** Cards rendered with visibility matched to Insight. Pick 2\. Hover states: Light \= golden glow, Dark \= purple glow. Optional reroll (cost TBD — may be vessel-specific).

**4C — Reckoning:** Parity preview after card deltas: Light X→X+Δ, Dark Y→Y+Δ. Keeper commentary — conditional on card combination, vessel match, and insight level. Stakes shown before Level entry.

# **VI. OPEN QUESTIONS**

*Design decisions not yet locked. These are the live edges of the system.*

* Reroll mechanic: One per keeper, or vessel-specific? Does it cost resources? Rebel pushing back on the Keeper vs. convenience affordance.

* Card visibility default: Mostly blind with reveals, or mostly visible with mystery cards mixed in? TBD during Redux wiring.

* Exile mechanics: Distinct from both choice-based (Rebel) and slip-based vessels. What is the mechanical expression of 'was removed, not fallen'?

* Level mini-game contents: Container architecture exists. What goes inside? First prototype target needed.

* Keeper favor accumulation: How does favor build with Surveyor vs. Smuggler? Does it affect pool composition beyond draft bias?

* Quote attribution timing: Revealed at Insight 3 — but does the Reckoning screen (4C) ever surface the attribution as a reaction to your choice?

* SEALED cards: What unlock conditions appear at which depths? First SEALED card candidate: Root-Whisper at depth 4 survival.

* Title screen exit: Red dot top right or equivalent. Front door needs a way back out.

*Compiled from design sessions — Week of Feb 24–25 \+ Mar 1, 2026*

Radiant Seven Ecosystem  ·  Sinerine — The Dudael Drop  ·  V-00