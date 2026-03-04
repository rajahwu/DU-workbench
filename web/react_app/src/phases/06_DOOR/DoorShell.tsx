import { getRunMeta } from "@du/phases";
import { getDoorCosts, getSecretDoorThreshold, type VesselId } from "@data/vessels/vessels";
import type { PhaseId } from "@du/phases/types";
import { buildWallPacket, type DoorToDropWall, type DoorToDraftWall } from "@du/phases/types";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { requestTransition } from "@/app/requestTransition";
import { selectRun } from "@/app/runSlice";
import DoorScreen from "./DoorScreen";

/**
 * DoorShell — data + dispatch layer.
 * Owns: runMeta, door cost computation, packet building, transitions.
 * Renders: DoorScreen (presentational).
 */
export default function DoorShell() {
    const runMeta = getRunMeta();
    const dispatch = useAppDispatch();
    const run = useAppSelector(selectRun);

    const light = runMeta.alignment.current.light;
    const dark = runMeta.alignment.current.dark;
    const depth = runMeta.progress.depth;
    const maxDepth = 5;

    const vesselId = (runMeta.runner.vesselId ?? "EXILE") as VesselId;
    const { lightCost, darkCost } = getDoorCosts(vesselId, depth);
    const secretThreshold = getSecretDoorThreshold(vesselId);

    const canLight = light >= lightCost;
    const canDark = dark >= darkCost;
    const canSecret = dark - light >= secretThreshold;
    const isMaxDepth = depth >= maxDepth;

    const handleChooseDoor = (path: "light" | "dark" | "secret") => {
        console.log(`🚪 Opening ${path.toUpperCase()} door. Continuing loop...`);

        const targetPhase = (isMaxDepth ? "07_drop" : "04_draft") as PhaseId;

        const wall = targetPhase === "07_drop"
            ? buildWallPacket("06_door", "07_drop", {
                kind: "door->drop",
                runId: run?.runId ?? runMeta.runId,
                doorChoice: path,
            } satisfies DoorToDropWall)
            : buildWallPacket("06_door", "04_draft", {
                kind: "door->draft",
                runId: run?.runId ?? runMeta.runId,
                doorChoice: path,
            } satisfies DoorToDraftWall);

        dispatch(requestTransition(wall));
    };

    const handleForcedDrop = () => {
        console.log("☠️ No doors available. Forced Drop.");
        const wall = buildWallPacket("06_door", "07_drop", {
            kind: "door->drop",
            runId: run?.runId ?? runMeta.runId,
            doorChoice: "dark",
        } satisfies DoorToDropWall);

        dispatch(requestTransition(wall));
    };

    return (
        <DoorScreen
            light={light}
            dark={dark}
            depth={depth}
            lightCost={lightCost}
            darkCost={darkCost}
            secretThreshold={secretThreshold}
            canLight={canLight}
            canDark={canDark}
            canSecret={canSecret}
            onChooseDoor={handleChooseDoor}
            onForcedDrop={handleForcedDrop}
        />
    );
}
