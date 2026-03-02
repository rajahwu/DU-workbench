You’re basically one step away from wiring this beautiful SelectShell into a real vessel system.

### 1. Add a vessels config module

Create `src/app/data/vessels.ts` and map your lore data into something the engine can use:

```ts
// src/app/data/vessels.ts
export type VesselId = 'seraph' | 'shadow' | 'exile' | 'penitent' | 'rebel';

export interface VesselEngineConfig {
  id: VesselId;
  displayName: string;
  startingLight: number;
  startingDark: number;
  maxHealth: number;
  handSize: number;
  draftBias: 'light' | 'dark' | 'neutral';
  usesInsight?: boolean;
}

export const VESSELS: Record<VesselId, VesselEngineConfig> = {
  seraph: {
    id: 'seraph',
    displayName: 'Seraph',
    startingLight: 3,
    startingDark: 0,
    maxHealth: 10,
    handSize: 2,
    draftBias: 'light',
  },
  shadow: {
    id: 'shadow',
    displayName: 'Shadow',
    startingLight: 0,
    startingDark: 3,
    maxHealth: 10,
    handSize: 2,
    draftBias: 'dark',
  },
  exile: {
    id: 'exile',
    displayName: 'Exile',
    startingLight: 2,
    startingDark: 2,
    maxHealth: 10,
    handSize: 2,
    draftBias: 'neutral',
  },
  penitent: {
    id: 'penitent',
    displayName: 'Penitent',
    startingLight: 3,
    startingDark: 1,
    maxHealth: 12,
    handSize: 2,
    draftBias: 'neutral',
    usesInsight: true,
  },
  rebel: {
    id: 'rebel',
    displayName: 'Rebel',
    startingLight: 1,
    startingDark: 3,
    maxHealth: 8,
    handSize: 3,
    draftBias: 'dark',
  },
};
```

You can enrich this later with the mechanics knobs we discussed.

### 2. Make SelectShell write engine‑ready data

Right now `handleLockVessel` only writes `vessel: activeVesselId`. Have it also attach starting stats from `VESSELS`:

```ts
import { VESSELS } from '@/app/data/vessels';
import { useAppDispatch } from "./app/hooks";
import { requestTransition } from "./app/phaseSlice";

const handleLockVessel = () => {
  const rawPacket = localStorage.getItem("dudael:active_packet");
  const packet = rawPacket
    ? JSON.parse(rawPacket)
    : { ts: Date.now(), user: { id: "guest", kind: "user" } };

  const engineConfig = VESSELS[activeVesselId];

  const updatedPacket = {
    ...packet,
    from: "02_select",
    to: "03_staging",
    player: {
      ...(packet.player || {}),
      vessel: activeVesselId,
      stats: {
        startingLight: engineConfig.startingLight,
        startingDark: engineConfig.startingDark,
        maxHealth: engineConfig.maxHealth,
        handSize: engineConfig.handSize,
        draftBias: engineConfig.draftBias,
      },
    },
  };

disptch(requestTransition({phase:"03_staging", packet: updatedPacke }))
  
};
```

Now Staging, Draft, and Level can consume a *uniform* `player.stats` shape instead of reverse‑engineering the lore block.

### 3. Keep SelectShell lore‑first

I’d leave the rest of SelectShell exactly as is: all the theology, SVG sigils, tags, and spectral stats stay here as **presentation**; the new `VESSELS` config is the minimal bridge that makes that identity change the actual run.

When you’re ready, we can take the same `VESSELS` config and thread it into:

- The Redux slice (initialize `light`, `dark`, `maxHealth`, `handSize`).  
- DraftShell (use `draftBias` to skew Surveyor/Smuggler offerings).  
- Level reducer (adjust damage/points/timer per vessel).