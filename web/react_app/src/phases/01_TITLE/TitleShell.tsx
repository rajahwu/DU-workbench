import { useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { initRun } from "@/app/runSlice";
import type { AppDispatch } from "@/app/store";
import { requestTransition } from "@/app/requestTransition";
import { buildWallPacket, PhaseWallPacket, TitleToSelectWall } from "@du/phases/types";
import TitleScreen from "./TitleScreen";

function createRunId() {
    return `run-${Date.now()}`;
}

export async function handleEnterFromTitle(dispatch: AppDispatch, userId?: string) {
    const runId = createRunId();

    const runner = {
        runnerId: runId,
        userId,
        displayName: "Wanderer", // or from profile
        vesselId: undefined,
        sigilKey: undefined,
    };

    dispatch(initRun({ runId, runner }));

    const payload: TitleToSelectWall = {
        kind: "title->select",
        userRef: { userId: userId ?? "guest" },
        pathHint: userId ? "full" : "lite",
    };

    const wall: PhaseWallPacket = buildWallPacket("01_title", "02_select", payload);

    // dispatch your existing requestTransition thunk with this wall
    dispatch(requestTransition(wall));
}

export default function TitleShell() {
    const dispatch = useAppDispatch();
    const [isBooting, setIsBooting] = useState(false);

    const onEnterDrop = async () => {
        if (isBooting) return;
        setIsBooting(true);
        await handleEnterFromTitle(dispatch);
        setIsBooting(false);
    };

    return <TitleScreen isBooting={isBooting} onEnterDrop={onEnterDrop} />;
}
