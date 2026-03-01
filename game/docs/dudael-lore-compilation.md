**DUDAEL**

*The Drop*

Sinerine — Lore Compilation | V-00

# **I. THE WORLD**

## **What Is Dudael?**

Dudael is a Quarantine Zone — a sealed region of space within Echo and Void's sector. It is the place where fallen angels are contained, observed, and made to descend. It is not a prison in the conventional sense; it is something more forensic. Evidence under glass.

The spiral is the visual language of Dudael. On the title screen, a grayscale gradient paint stroke spirals top to bottom — thick and round, thinning to light. This is not decoration. This is the path down. Light to dark or dark to light depending on how you read it.

*Dudael is serious, atmospheric, and deliberate. It is not a candy-colored mobile game. It operates in the forensic theophany aesthetic — clinical, examining.*

## **The Meta-Universe Link**

Dudael connects to the broader Radiant Seven universe through a specific narrative hook:

* The Watchers are rogue First Engineers — beings who broke from their original function.  
* The Dark cards are original Relics — artifacts from before the fall.  
* Dudael itself is a Quarantine Zone located in Echo and Void's sector — their territory, their containment system.

This is not a standalone story. The events of the Drop feed into the larger ecosystem.

# **II. THE ENTITIES**

## **The Five Vessel Classes (Sigils)**

There are five Vessel designations. Each represents a classification of fallen angel — a different relationship to the fall, to Light and Dark, and to the descent through Dudael.

### **1\. Seraph**

The highest order. Proximity to Light was total before the fall. The Seraph carries that memory — and that weight. Their mechanics reflect a being who once saw everything clearly and now must navigate partial blindness.

### **2\. Shadow**

Defined by concealment. The Shadow's relationship to the fall is one of disappearance rather than descent. They move differently through Dudael — not through force but through absence.

### **3\. Exile**

The Exile was cast out rather than falling. There is a difference. The Exile did not choose and did not slip — they were removed. This creates a distinct emotional and mechanical relationship to the zone they now inhabit.

### **4\. Penitent**

The Penitent is seeking something. Atonement, perhaps. Or understanding. They are the class most engaged with the lore — the one most likely to read the codex in the Staging Area. Their mechanics reward engagement.

### **5\. Rebel**

The Rebel's fall was a choice. They knew the cost and made the move anyway. This is the class with the most agency — and the most instability. They play differently because they think differently about Dudael.

## **The Two-Layer Character System**

Character selection in Dudael is not a single pick. It is a progressive selection with two distinct layers:

**Layer One — Sigil:** You select a Sigil. The Sigil is the fixed identity — the entity you are inheriting. The lore, the geometry, the aesthetic. This is what you are.

**Layer Two — Vessel:** The Vessel is the player's choice within the Sigil's constraints. This is where agency lives. The Sigil is what you are — the Vessel is how you carry it.

*The theological thread in the mechanics: Fallen angels didn't choose to fall, but they choose how they carry it.*

There are two aspects to the character — the bound entities (given, inherited with the Sigil) and the chosen Vessel (selected, configured by the player). This creates gameplay tension between what's given and what's chosen.

## **The Guides**

In the CARD\_DRAFT room, the player meets two guides: Light and Dark. They are children.

*This is deliberate. The guides through Dudael are not powerful figures. They are young. That says something about the nature of the descent — innocence leading the fallen, not strength.*

The child guides are the face of the draft. Behind them, the engine is calculating alignment, shaping the card pull, generating level options. The player sees children offering choices. The machine sees a weighted probability system responding to everything that happened in the Staging Area.

## **The Keepers**

Two Keepers manage the Staging Area and meta-currency:

* The Surveyor — aligned with Light. Manages the economy of clarity and revelation.  
* The Smuggler — aligned with Dark. Manages the economy of concealment and relic trading.

Their exact roles in the Staging Area are to be developed — but their function is custodial. They maintain the locker room between runs.

# **III. THE GAME PHASES**

The game flows through six rooms in sequence. The phase state machine moves: TITLE → CHARACTER\_SELECT → STAGING → CARD\_DRAFT → LEVEL\_PLAY → DOOR → DROP/LOOP.

## **Room One — TITLE**

The player sees a title, a subtitle, and a mood. The spiral gradient. One action: Start.

Behind the walls, the Redux store is already warm — not empty. It holds: User (guest), Settings/config, Identity and entities, Local storage and SQLite. The house has the lights on before the player does anything.

Open issue: A clear exit is missing from the title screen. Red dot top right or equivalent. The front door needs a way back out.

## **Room Two — CHARACTER\_SELECT**

The player sees the cast — Sigils and profiles. This is where the HTML prototype becomes real React Redux. The final port lands here.

Progressive selection: Choose a Sigil, then configure the Vessel within it. Two steps, one room. The player makes a meaningful decision before drawing a single card.

## **Room Three — STAGING**

The locker room. The room between choosing who you are and actually playing.

What is here: Lore. The player can read about what they just chose — who this entity is, what the Sigil means, what Dudael is, what they are about to walk into. The codex opens here. Not mandatory — available.

On a first run: almost nothing. The locker room on day one is mostly empty. No history, no previous run data, no unlocked lore entries. It is a pass-through.

On subsequent runs: this room fills up. Previous run data, unlocked lore entries, Vessel progression. The room that is nearly empty on day one becomes the room you spend the most time in on day twenty.

*The Staging Area is also weighing the player. What was read, what was interacted with — this influences what the CARD\_DRAFT generates.*

## **Room Four — CARD\_DRAFT**

This is where the game actually begins.

The player sees the guides — Light and Dark, children — and chooses a card or card set. Simple on the surface.

Behind the walls: The card pull is created, not randomly generated. It is influenced by locker room activity. Alignment is being calculated — Light and Dark as a scale, and the draft tips it. From that alignment, level options are generated.

*The player thinks they are picking cards. They are actually choosing which version of the next room they will walk into. The draft creates the level. The game you are about to play is a consequence of the choices you just made.*

Card visibility is an information game — at Depth 1, mostly reading lore and guessing. By Depth 4, a Vessel has accumulated enough keywords and parity state that two or three mechanical indicators appear per card. The game becomes more legible as the player descends deeper — but the stakes are higher.

## **Room Five — LEVEL\_PLAY**

The actual gameplay container. This room loads differently every time because of what happened in CARD\_DRAFT.

LEVEL\_PLAY is a container, not a game. It hosts whatever the level type calls for — mini game or puzzle. The engine mounts the right one and passes it the state. The specific contents of this room are the most open in the architecture — defined by content, not function.

## **Room Six — DOOR / DROP / LOOP**

The exit point of each run. The Door is the transition. The Drop is what happens when the run ends — death in Dudael feeds into persistent progression. The Loop is how the player returns.

The meta-loop: dying in the Dudael Drop is not a reset. It is a contribution to what the Staging Area becomes on the next run.

# **IV. CORE MECHANICS**

## **Light / Dark Parity Economy**

Light and Dark are not just resources — they are a scale. The economy tracks parity: the ratio of Light to Dark accumulated across a run.

Every card choice in CARD\_DRAFT tips the scale. Every level played shifts it further. By the time the player reaches the Door, their parity state is a record of every choice they made.

Parity scales with depth. At shallow depths, the difference is subtle. As the player descends, the spread between Light and Dark intensifies — the economy has more momentum and the choices matter more.

## **The Draft as Information Game**

The CARD\_DRAFT is not pick-your-favorite. It is an information game with partial visibility:

* Early runs: limited card information, mostly lore text.  
* Later runs: more mechanical indicators surface — parity value, card type, keywords, synergy tags.  
* The Vessel class determines hand size and which cards appear.

Card visibility system to be designed: mostly blind with reveals, or mostly visible with some mystery cards? TBD during Redux wiring.

## **Meta-Progression**

Persistence across runs is core to the design. The Staging Area accumulates history. Vessel stats persist or evolve. Lore entries unlock. The locker room fills.

This is roguelike depth — the run ends but the player does not start from zero.

# **V. IDENTITY & TONE**

## **Sinerine Brand**

Sinerine is the brand identity for the game system. The Sinerine database in Supabase holds the V-00 Tri-Polar color palette and typography specs.

Tri-Polar color system: three poles of color that create the visual language of the UI — light end, dark end, and a third axis. The palette is grayscale-anchored with accent capacity.

## **Forensic Theophany Aesthetic**

*Clinical. Examining. Evidence under glass.*

The game does not explain itself emotionally. It presents. The player reads the lore, observes the patterns, and draws conclusions. The aesthetic communicates: you are studying something that once had enormous power and is now contained.

Rock opera audio cues — the sound design has theatrical and musical weight. Not ambient. Not minimal. The sound is a participant.

## **The Oikētērion Theology**

The LorePage codex grounds the five Vessel classes in ancient oikētērion theology — the concept of a proper dwelling or habitation. In theological use, oikētērion refers to the body as the dwelling place of the spirit, and in some traditions, to the angels' proper station.

The fallen angels of Dudael have abandoned their oikētērion — their proper place. The Quarantine Zone is where they wait. The Drop is how they process what they chose or what happened to them.

# **VI. TECHNICAL ARCHITECTURE**

## **Codebase Structure (DDD Workspace)**

* lite-game — game mechanics, Redux state machine, gameplay components  
* game-lore — narrative, codex, lore content  
* admin — ops, internal tools

## **State Machine (V-00)**

The Redux Toolkit state machine manages all phase transitions. The app transitions through GamePhase states: TITLE → CHARACTER\_SELECT → STAGING → CARD\_DRAFT → LEVEL\_PLAY → DOOR → DROP/LOOP.

The store tracks: Vessel, Depth, Light/Dark economy, user state (guest until authenticated).

## **Supabase Database**

Seeded with: V-00 Tri-Polar color palette, typography specs, 12 lore-accurate core cards, Vessel classification registry.

## **Current Priorities (Post V-00)**

* Redux refactor: wire Vessel registry (stability, handSize, keywords)  
* Draft card visibility system design  
* Level as flexible mini-game container  
* Admin and lore codex redesign  
* HTML → React Redux port for CHARACTER\_SELECT

*Compiled from active sessions — Week of Feb 24–25, 2026*  
Radiant Seven Ecosystem | Sinerine — The Dudael Drop