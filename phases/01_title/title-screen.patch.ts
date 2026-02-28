/**
 * TITLE SCREEN — EXCHANGE INTEGRATION PATCH
 *
 * Drop this into title-screen.ts at the bottom,
 * replacing the stub onEnterDudael() function.
 *
 * This is the seam between the animation and the game.
 */

import { titleExchange, loadUserProfile, commitExchange } from "./title-exchange";
import type { SelectionPool, PlayerIdentity } from "./title.types";

// ─────────────────────────────────────────────
// Your player pool (wire to DB / static data)
// ─────────────────────────────────────────────

const DEFAULT_POOL: SelectionPool<PlayerIdentity> = {
  id: "pool:players:v1",
  items: [
    { id: "player:du-01", kind: "player", displayName: "Vessel One",  sigil: "sigil:iron",   vessel: "vessel:wanderer" },
    { id: "player:du-02", kind: "player", displayName: "Vessel Two",  sigil: "sigil:ember",  vessel: "vessel:archivist" },
    { id: "player:du-03", kind: "player", displayName: "Vessel Three", sigil: "sigil:still", vessel: "vessel:hollow" },
  ],
  rules: { maxPick: 1 },
};

// ─────────────────────────────────────────────
// Replace this in title-screen.ts:
//
//   function onEnterDudael() {
//     console.log(">> Entering Dudael...");
//   }
//
// With this:
// ─────────────────────────────────────────────

async function onEnterDudael() {
  // Load what the user brought to the door
  const profile = await loadUserProfile();

  // The exchange
  const result = titleExchange(profile, DEFAULT_POOL);

  // Commit to localStorage (router will pick it up)
  commitExchange(result);

  // Log the path taken (remove in production)
  console.log(`>> Exchange complete. Path: ${result.path}`);
  console.log(`>> Packet:`, result.packet);

  // Hand off to your router
  // React:   dispatch(setActivePacket(result.packet)); navigate("/select");
  // CLI:     phaseManager.transition(result.packet);
  // Vanilla: window.dispatchEvent(new CustomEvent("dudael:exchange", { detail: result }));

  window.dispatchEvent(
    new CustomEvent("dudael:exchange", { detail: result })
  );
}

// ─────────────────────────────────────────────
// Listen from your router / phase manager:
//
//   window.addEventListener("dudael:exchange", (e) => {
//     const result = (e as CustomEvent).detail;
//     router.receive(result.packet);
//   });
// ─────────────────────────────────────────────