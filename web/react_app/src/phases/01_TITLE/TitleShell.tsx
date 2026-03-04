// phases/01_title/title-shell.tsx
import { useAppDispatch } from "@/app/hooks";
import { initRun } from "@app/runSlice";
import type { AppDispatch } from "@/app/store";
import { requestTransition } from "@/app/phaseSlice";
import { buildWallPacket, PhaseWallPacket, TitleToSelectWall } from "@du/phases/types";

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
