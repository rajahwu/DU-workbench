// workbench/web/react_app/boot-walk.ts
import { boot } from "@/workbench/phases/boot";
import { installPhaseWalkHotkeys } from "@/workbench/phases/dev-walk";

boot();
installPhaseWalkHotkeys();

if (!window.sessionStorage.getItem("dudael:dev_started")) {
  window.sessionStorage.setItem("dudael:dev_started", "1");

  window.dispatchEvent(
    new CustomEvent("dudael:exchange", {
      detail: { from: "01_title", to: "02_select", ts: Date.now(), user: { id: "guest" } },
    })
  );
}