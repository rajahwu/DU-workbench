import { useState } from "react";
import { getRunMeta, buildPacket } from "@du/phases";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import StagingScreen from "./StagingScreen";

/**
 * StagingShell — data + dispatch layer.
 * Owns: runMeta reading, packet building, transition to Draft.
 * Renders: StagingScreen (presentational).
 */
export default function StagingShell() {
    const [activePhaseId, setActivePhaseId] = useState<string>("staging");
    const dispatch = useAppDispatch();
    const runMeta = getRunMeta();

    const handleInitiateDraft = () => {
        console.log("⏬ Commencing Draft sequence...");
        const rawPacket = localStorage.getItem("dudael:active_packet");
        const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        const updatedPacket = buildPacket("03_staging", "04_draft", {
            ...packet,
        });

        dispatch(requestTransition("04_draft", updatedPacket));
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
