import { boot } from "@du/phases";
import { installPhaseWalkHotkeys } from "./dev-walk";

boot();
installPhaseWalkHotkeys();

if (!sessionStorage.getItem("dudael:dev_started")) {
  sessionStorage.setItem("dudael:dev_started", "1");

  window.dispatchEvent(
    new CustomEvent("dudael:exchange", {
      detail: { from: "01_title", to: "02_select", ts: Date.now(), user: { id: "guest" } }
    })
  );
}