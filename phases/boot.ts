// phases/boot.ts
import { initRunMeta, restoreSnapshot, hydrateFromSnapshot, clearSnapshot } from "./meta";
import { initManager, transition, type PhasePacket } from "./manager";

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

  // optional validation, per your rules:
  if (p["user"] && !isObject(p["user"])) return false;

  return true;
}

function sessionIdFromPacket(packet: PhasePacket) {
  // keep it deterministic across reloads
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

export function recoverRun(): { ok: boolean; reason?: string } {
  const snap = restoreSnapshot();
  if (!snap) return { ok: false, reason: "no_snapshot" };
  hydrateFromSnapshot(snap);
  initManager(snap.phaseHistory[snap.phaseHistory.length - 1] ?? "01_title");
  return { ok: true };
}

export function boot() {
  // Try to recover first (page reload mid-descent)
  const recovered = recoverRun();
  if (!recovered.ok) {
    // fresh start
    clearSnapshot();
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

    // init run meta + manager
    const sid = sessionIdFromPacket(detail);
    initRunMeta(sid, {
      phaseHistory: [detail.from],
      // you can seed alignment/depth/inventory here if your packet includes them
    });

    initManager(detail.from);

    // first transition (usually title -> select)
    transition(detail.to, detail);
  });
}