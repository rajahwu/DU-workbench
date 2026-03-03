src/
├── assets/                  # images, icons, fonts, sounds later
│   ├── icons/
│   ├── sigils/
│   └── theology/            # background art, phase illustrations
│
├── components/              # reusable UI pieces (shared across phases)
│   ├── shared/
│   │   ├── VesselCard.tsx
│   │   ├── VesselSigil.tsx
│   │   ├── BiasBar.tsx      # the light/dark fill bars
│   │   ├── PhaseHeader.tsx  # top-bar with "Phase XX - Name"
│   │   ├── TheologyLine.tsx # flavor text block (reusable)
│   │   └── ConfirmButton.tsx
│   └── ui/                  # very generic (Button, Card wrapper, etc.) — add later if needed
│
├── data/                    # static game content — easy to edit / expand
│   ├── vessels.ts           # export const vessels: Vessel[]
│   ├── entities.ts          # export const entities: Entity[]   ← new!
│   └── phases/              # per-phase flavor if it grows
│       └── phase-02.ts      # e.g. { theologyLine: "The fall was not an end..." }
│
├── features/                # domain/feature slices (optional but great for growth)
│   ├── vessel-selection/
│   │   ├── SelectScreen.tsx
│   │   ├── VesselGrid.tsx
│   │   └── useVesselSelection.ts   # local logic if needed
│   └── entity-descent/      # future phase where entity chooses vessel?
│
├── game/                    # core game systems & state
│   ├── types.ts             # Vessel, Entity, GameState, LoopgameAPI, etc.
│   ├── useLoopGame.ts       # your main hook / store (zustand / context / reducer)
│   ├── gameMachine.ts       # if you switch to XState later — optional
│   └── systems/
│       ├── entitySystem.ts  # logic: bind entity → vessel, descent rules
│       └── vesselSystem.ts  # validation, stats calc, bias merging, etc.
│
├── phases/                  # one folder per phase — keeps navigation linear
│   ├── 01-title/
│   │   └── TitleScreen.tsx
│   ├── 02-select/
│   │   ├── SelectScreen.tsx        ← your current file, slimmed
│   │   └── VesselGrid.tsx
│   ├── 03-staging/
│   ├── 04-draft/
│   ├── 05-level/
│   └── ...                  # 06-door, etc.
│
├── styles/
│   ├── global.css
│   ├── variables.css        # --light, --dark, colors
│   └── phase-02.module.css  # if using CSS modules
│
├── utils/
│   └── cn.ts                # classnames helper (if using clsx/tailwind-merge)
│
└── App.tsx                  # root, router, provider wrapper
   └── main.tsx. <--- awe fuck, I just peeked over there,it's a lot 😅, that's why sleep so soundly 😅