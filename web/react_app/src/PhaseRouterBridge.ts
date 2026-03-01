import { useEffect } from "react";
import { useNavigate } from "react-router";
import { routerReact } from "@du/phases";

export function PhaseRouterBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    const core = routerReact(navigate);
    return () => core.dispose();
  }, [navigate]);

  return null;
}