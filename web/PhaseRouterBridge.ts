// workbench/web/PhaseRouterBridge.ts
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { routerReact } from "@/workbench/phases/router";

export function PhaseRouterBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    const core = routerReact(navigate);
    return () => core.dispose();
  }, [navigate]);

  return null;
}