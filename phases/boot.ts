// phases/boot.ts
import {
  initRunMeta,
  restoreSnapshot,
  hydrateFromSnapshot,
  clearSnapshot,
} from "./meta";

import type { PhaseId, PhasePacket } from "./types";

const ACTIVE_PACKET_KEY = "dudael:active_packet";

type ExchangeEventDetail = PhasePacket;

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function validatePacket(p: unknown): p is PhasePacket {
  if (!isObject(p)) return false;
  const from = p["from"];
  const to = p["to"];
  const ts = p["ts"];

  if (typeof from !== "string" || typeof to !== "string") return false;
  if (typeof ts !== "number" || !Number.isFinite(ts)) return false;

  if (p["user"] && !isObject(p["user"])) return false;

  return true;
}

function sessionIdFromPacket(packet: PhasePacket) {
  const uid = packet.user?.id ?? "guest";
  return `run_${uid}_${Math.floor(packet.ts)}`;
}

export function commitActivePacket(packet: PhasePacket) {
  try {
    localStorage.setItem(ACTIVE_PACKET_KEY, JSON.stringify(packet));
  } catch {
    // ignore
  }
}

export function readActivePacket(): PhasePacket | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PACKET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validatePacket(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Recover run meta from sessionStorage snapshot.
 * NOTE: This no longer initializes or sets phase in any manager.
 * The surface (Redux) is authoritative for current phase.
 */
export function recoverRun(): { ok: boolean; phase?: PhaseId; reason?: string } {
  const snap = restoreSnapshot();
  if (!snap) return { ok: false, reason: "no_snapshot" };

  hydrateFromSnapshot(snap);

  const last =
    (snap.history.phaseTrail[snap.history.phaseTrail.length - 1] as PhaseId | undefined) ??
    "01_title";

  return { ok: true, phase: last };
}

/**
 * Boot wires packet exchange → run meta seeding, then emits an event for the UI layer
 * to perform the actual transition via Redux.
 */
export function boot() {
  // Try to recover first (page reload mid-descent)
  const recovered = recoverRun();
  if (!recovered.ok) {
    clearSnapshot();
  } else {
    // Optional: let surface know what phase we think we're in from snapshot
    window.dispatchEvent(
      new CustomEvent("dudael:boot_recovered", {
        detail: { phase: recovered.phase },
      })
    );
  }

  window.addEventListener("dudael:exchange", (e) => {
    const detail = (e as CustomEvent<ExchangeEventDetail>).detail;

    if (!validatePacket(detail)) {
      window.dispatchEvent(
        new CustomEvent("dudael:boot_error", {
          detail: { reason: "invalid_packet" },
        })
      );
      return;
    }

    // store for other subsystems
    commitActivePacket(detail);

    // init run meta (authoritative timeline for the run)
    const sid = sessionIdFromPacket(detail);
    initRunMeta(sid, {
      history: { phaseTrail: [detail.from] },
      // seed alignment/depth/inventory here if packet includes them later
    });

    // IMPORTANT: do NOT transition here anymore.
    // Tell the surface to request the transition via Redux.
    window.dispatchEvent(
      new CustomEvent("dudael:boot_packet", {
        detail,
      })
    );
  });
}