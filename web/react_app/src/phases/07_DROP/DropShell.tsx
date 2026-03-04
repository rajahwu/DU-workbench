import { getRunMeta } from "@du/phases";
import { buildWallPacketForEdge, type DropToStagingWall } from "@du/phases/types";
import { shouldIncrementMetaCounter, VESSELS, type VesselId } from "@data/vessels/vessels";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { requestTransition } from "@/app/requestTransition";
import { selectRun } from "@/app/runSlice";
import DropScreen from "./DropScreen";

/**
 * DropShell — data + dispatch layer.
 * Owns: runMeta, packet reading, meta progression check, transition back to Staging.
 * Renders: DropScreen (presentational).
 */
export default function DropShell() {
    const runMeta = getRunMeta();
    const dispatch = useAppDispatch();
    const run = useAppSelector(selectRun);

    const vesselId = (runMeta.runner.vesselId ?? "EXILE") as VesselId;
    const vesselConfig = VESSELS[vesselId];

    const levelResult = run.history.lastLevelResult
        ? {
            survived: run.history.lastLevelResult.survived,
            points: run.history.lastLevelResult.points,
        }
        : { survived: false, points: runMeta.progress.depth };

    const survived = run.history.lastDropReason === "death"
        ? false
        : levelResult.survived;

    const metaIncremented = shouldIncrementMetaCounter(vesselId, {
        insight: runMeta.metaFlags.penitentInsight,
        currentLight: runMeta.alignment.current.light,
        currentDark: runMeta.alignment.current.dark,
    });

    const handleReturnToStaging = () => {
        console.log("♻️ Run concluded. Looping back to Staging...");
        const wall = buildWallPacketForEdge("07_drop", "03_staging", {
            kind: "drop->staging",
            runId: run?.runId ?? runMeta.runId,
            dropReason: "exit",
        } satisfies DropToStagingWall);

        dispatch(requestTransition(wall));
    };

    return (
        <DropScreen
            runMeta={runMeta}
            survived={survived}
            levelResult={levelResult}
            vesselConfig={vesselConfig}
            metaIncremented={metaIncremented}
            lastDoorChoice={run.history.lastDoorChoice}
            lastDropReason={run.history.lastDropReason}
            onReturnToStaging={handleReturnToStaging}
        />
    );
}
