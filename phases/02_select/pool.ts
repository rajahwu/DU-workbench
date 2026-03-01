import type { SelectionPool, PlayerIdentity } from "../types";

const DEFAULT_POOL: SelectionPool<PlayerIdentity> = {
  id: "pool:players:v1",
  items: [
    { id: "player:du-01", kind: "player", displayName: "Vessel One",  sigil: "sigil:iron",   vessel: "vessel:wanderer" },
    { id: "player:du-02", kind: "player", displayName: "Vessel Two",  sigil: "sigil:ember",  vessel: "vessel:archivist" },
    { id: "player:du-03", kind: "player", displayName: "Vessel Three", sigil: "sigil:still", vessel: "vessel:hollow" },
  ],
  rules: { maxPick: 1 },
};

export { DEFAULT_POOL };