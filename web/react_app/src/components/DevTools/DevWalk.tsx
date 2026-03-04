import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import type { PhaseId } from "@du/phases";
import type { PhasePacket } from "@du/phases";

export function BootPacketBridge() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onBootPacket = (e: Event) => {
      const packet = (e as CustomEvent<PhasePacket>).detail;
      // This uses legality rules in the engine (via requestTransition thunk)
      dispatch(requestTransition(packet.to, packet));
    };

    window.addEventListener("dudael:boot_packet", onBootPacket);
    return () => window.removeEventListener("dudael:boot_packet", onBootPacket);
  }, [dispatch]);

  return null;
}

export function DevWalk() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // example: Shift+1..7 jump (dev only)
      if (!e.shiftKey) return;

      const map: Record<string, PhaseId> = {
        "1": "01_title",
        "2": "02_select",
        "3": "03_staging",
        "4": "04_draft",
        "5": "05_level",
        "6": "06_door",
        "7": "07_drop",
      };

      const to = map[e.key];
      if (!to) return;

      e.preventDefault();

      // ⚠️ This will fail if illegal from current phase.
      // If you want "force jump" for dev, I’ll show that below.
      dispatch(requestTransition(to));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  return null;
}
