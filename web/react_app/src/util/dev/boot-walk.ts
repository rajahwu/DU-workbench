// web/react_app/boot-walk.ts (or wherever)
import { store } from "@/app/store";
import { requestTransition } from "@/app/phaseSlice";
import { setPhase } from "@/app/phaseSlice";


window.addEventListener("keydown", (e) => {
  store.dispatch(setPhase("06_door"));
  if (e.shiftKey && e.key === "3") {
    store.dispatch(requestTransition("03_staging"));
  }
});