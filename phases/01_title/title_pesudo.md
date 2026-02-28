

```js
// PHASE 01 — TITLE SCREEN
// The Exchange: User becomes Player

function TitleScreen(state, user) {

  // System meets user at the door
  operator = user

  // Check what the user brought
  hasProfile = operator.profile exists
  hasPreferences = operator.preferences exists

  // Telemetry handshake
  if (player.telemetry.ok(state.request)) {
    access = player.access(test)
  }

  // The Exchange
  if (hasProfile AND hasPreferences AND access) {
    // Full entity exchange — player context loaded
    route = EntityExchange.goToSelection(player)
  } else {
    // System defaults — lite path
    route = goToSelect(system.lite)
  }

  // Either way, the user is now a player
  // The quality of what comes next depends
  // on what they brought to the door

  display:
    - title
    - subtitle
    - grayscale spiral gradient (mood of descent)
    - exit button (red dot, top right)
    - start action (triggers the exchange)

  store already warm:
    - user (guest or returning)
    - settings / config
    - identity and entities
    - localStorage + SQLite

  on start:
    execute exchange
    transition → PHASE 02 CHARACTER_SELECT
}
```