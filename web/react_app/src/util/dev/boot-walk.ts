// web/react_app/boot-walk.ts (or wherever)
import { store } from "@/app/store";
import { requestTransition } from "@/app/requestTransition";
import { setPhaseAndWall } from "@/app/phaseSlice";
import { buildWallPacket } from "@du/phases/types";


window.addEventListener("keydown", (e) => {
  store.dispatch(setPhaseAndWall({ phase: "06_door", wall: null }));
  if (e.shiftKey && e.key === "3") {
    store.dispatch(
      requestTransition(
        buildWallPacket("06_door", "03_staging", {
          kind: "door->staging",
          runId: "dev-run",
          doorChoice: "secret",
        }),
      ),
    );
  }
});