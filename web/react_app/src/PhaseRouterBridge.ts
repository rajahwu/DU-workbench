import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "./app/hooks";
import { selectPhase } from "./app/phaseSlice";
import { phaseToPath } from "@du/phases/router";

function normalize(pathname: string) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean === "/" ? "/title" : clean;
}

export function PhaseRouterBridge() {
  const phase = useAppSelector(selectPhase);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const desired = phaseToPath(phase);
    const current = normalize(location.pathname);

    if (current !== desired) {
      navigate(desired, { replace: true });
    }
  }, [phase, location.pathname, navigate]);

  return null;
}