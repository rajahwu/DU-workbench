/**
 * PHASE 01 — TITLE EXCHANGE
 * The door logic. User becomes Player.
 *
 * Called by onEnterDudael() after the animation completes.
 * Returns a PhasePacket: the contract that carries identity forward.
 *
 * This module is runtime-agnostic — no DOM, no Pixi, no React.
 * The animation calls it. The router receives it.
 */

import { UserIdentity } from "./title.types";

import {
  PhasePacket,
  PlayerIdentity,
  SelectionPool,
} from "../types";

// ─────────────────────────────────────────────
// Profile shape (what we read from storage/DB)
// ─────────────────────────────────────────────

export type UserProfile = {
  id: string;
  displayName?: string;
  preferences?: {
    colorMode?: "dark" | "light" | "system";
    accessibility?: Record<string, boolean>;
  };
  // telemetry consent — required for full entity exchange
  telemetryConsent?: boolean;
};

// ─────────────────────────────────────────────
// Exchange result
// ─────────────────────────────────────────────

export type ExchangeResult =
  | { path: "full"; packet: PhasePacket; pool: SelectionPool<PlayerIdentity> }
  | { path: "lite"; packet: PhasePacket };

// ─────────────────────────────────────────────
// The Exchange
// ─────────────────────────────────────────────

/**
 * System meets user at the door.
 * Checks what they brought.
 * Decides which path opens.
 *
 * @param profile  - loaded from localStorage / Supabase / null for guest
 * @param pool     - available player identities for selection
 */
export function titleExchange(
  profile: UserProfile | null,
  pool: SelectionPool<PlayerIdentity>
): ExchangeResult {
  const ts = Date.now();

  // Build user identity
  const user: UserIdentity = {
    id: profile?.id ?? `guest:${crypto.randomUUID()}`,
    kind: "user",
  };

  const hasProfile = !!profile;
  const hasPreferences = !!(profile?.preferences && Object.keys(profile.preferences).length > 0);
  const hasConsent = !!profile?.telemetryConsent;

  // Full exchange — player context loaded, selection pool offered
  if (hasProfile && hasPreferences && hasConsent) {
    const packet: PhasePacket = {
      from: "01_title",
      to: "02_select",
      ts,
      user,
      selection: { pool, chosen: null },
      meta: { path: "full", displayName: profile!.displayName, pool: pool.id },
    };
    return { path: "full", packet, pool };
  }

  // Lite path — system defaults, guest player assigned
  const guestPlayer: PlayerIdentity = {
    id: `player:guest-${ts}`,
    // kind: "player",
    displayName: "Traveler",
  };

  const packet: PhasePacket = {
    from: "01_title",
    to: "02_select",
    ts,
    user,
    player: guestPlayer,
    selection: { pool, chosen: guestPlayer },
    meta: { path: "lite" },
  };

  return { path: "lite", packet };
}

// ─────────────────────────────────────────────
// Profile loader (wire to your actual store)
// ─────────────────────────────────────────────

/**
 * Attempt to load user profile.
 * Returns null if guest / not found.
 *
 * Replace with: Supabase query, Redux selector, or localStorage read.
 */
export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    const raw = localStorage.getItem("dudael:profile");
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

/**
 * Persist the exchange result for downstream phases.
 * Writes to localStorage as the ephemeral run record.
 * Redux / Supabase sync happens in the router.
 */
export function commitExchange(result: ExchangeResult): void {
  const key = "dudael:active_packet";
  try {
    localStorage.setItem(key, JSON.stringify(result.packet));
  } catch {
    // storage unavailable — runtime will carry it in memory
  }
}