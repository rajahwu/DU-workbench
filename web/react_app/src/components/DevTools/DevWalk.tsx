import { useEffect } from "react";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/requestTransition";
import { setPhaseAndWall } from "@/app/phaseSlice";
import type { PhaseId } from "@du/phases";
import type { PhaseWallPacket } from "@du/phases/types";

export function BootWallBridge() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onBootWall = (e: Event) => {
      const wall = (e as CustomEvent<PhaseWallPacket>).detail;
      dispatch(requestTransition(wall));
    };

    window.addEventListener("dudael:boot_wall", onBootWall);
    return () => window.removeEventListener("dudael:boot_wall", onBootWall);
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

      dispatch(setPhaseAndWall({ phase: to, wall: null }));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  return null;
}
