import { useState } from "react";
import { getRunMeta } from "@du/phases";
import { buildWallPacket, type PhaseWallPacket, type StagingToDraftWall } from "@du/phases/types";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { requestTransition } from "@/app/requestTransition";
import { selectRun } from "@/app/runSlice";
import StagingScreen from "./StagingScreen";

/**
 * StagingShell — data + dispatch layer.
 * Owns: runMeta reading, packet building, transition to Draft.
 * Renders: StagingScreen (presentational).
 */
export default function StagingShell() {
    const [activePhaseId, setActivePhaseId] = useState<string>("staging");
    const dispatch = useAppDispatch();
    const run = useAppSelector(selectRun);
    const runMeta = getRunMeta();

    const handleInitiateDraft = () => {
        console.log("⏬ Commencing Draft sequence...");
        const payload: StagingToDraftWall = {
            kind: "staging->draft",
            runId: run?.runId ?? runMeta.runId,
        };
        const wall: PhaseWallPacket = buildWallPacket("03_staging", "04_draft", payload);

        dispatch(requestTransition(wall));
    };

    return (
        <StagingScreen
            activePhaseId={activePhaseId}
            onSelectPhase={setActivePhaseId}
            onInitiateDraft={handleInitiateDraft}
            runMeta={runMeta}
        />
    );
}
