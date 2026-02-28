const DEFAULT_PLAYER_POOL: SelectionPool<PlayerIdentity> = {
  id: "pool:players:v1",
  items: [
    { id: "player:01", kind: "player", displayName: "Vessel 01" },
    { id: "player:02", kind: "player", displayName: "Vessel 02" },
    { id: "player:03", kind: "player", displayName: "Vessel 03" },
  ],
  rules: { maxPick: 1 },
};