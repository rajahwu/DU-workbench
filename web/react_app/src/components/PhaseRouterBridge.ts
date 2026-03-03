import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { selectPhase } from "../app/phaseSlice";
import { phaseToPath } from "@du/phases/router";
import "@/components/boot-walk";

function normalize(pathname: string) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean === "/" ? "/title" : clean;
}

function isWithin(desired: string, current: string) {
  if (current === desired) return true;
  // allow nested routes like /draft/approach when desired is /draft
  return current.startsWith(desired + "/");
}

export default function PhaseRouterBridge() {
  const phase = useAppSelector(selectPhase);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const desired = phaseToPath(phase);
    const current = normalize(location.pathname);

    if (!isWithin(desired, current)) {
      navigate(desired, { replace: true });
    }
  }, [phase, location.pathname, navigate]);
  
  return null;
}

