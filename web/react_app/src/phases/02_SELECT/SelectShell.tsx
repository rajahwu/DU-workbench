// phases/02_select/select-shell.tsx
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectRun, lockGate } from "@app/runSlice";
import { requestTransition } from "@/app/phaseSlice";
import {
    buildWallPacket,
    PhaseWallPacket,
    SelectToStagingWall,
    GateChoice,
    VesselId,
} from "@du/phases/types";

export function useSelectHandlers() {
    const dispatch = useAppDispatch();
    const run = useAppSelector(selectRun);

    function handleLockGate(choice: Required<GateChoice>) {
        if (!run) {
            console.warn("No run initialized before Gate lock");
            return;
        }

        // 1) Update persistent run state
        dispatch(
            lockGate({
                choice,
                lockedAt: "03_staging",
            }),
        );

        // 2) Build minimal wall packet to Staging
        const payload: SelectToStagingWall = {
            kind: "select->staging",
            runId: run.runId,
            runnerRef: { runnerId: run.runner.runnerId },
            gateChoice: choice,
            // alignmentSnapshot optional: only if Staging needs immediate parity
        };

        const wall: PhaseWallPacket = buildWallPacket(
            "02_select",
            "03_staging",
            payload,
        );

        dispatch(requestTransition(wall));
    }

    return { handleLockGate };
}
