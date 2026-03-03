import { getRunMeta, buildPacket } from "@du/phases";
import { getDoorCosts, getSecretDoorThreshold, type VesselId } from "@data/vessels/vessels";
import type { PhaseId } from "@du/phases/types";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import DoorScreen from "./DoorScreen";

/**
 * DoorShell — data + dispatch layer.
 * Owns: runMeta, door cost computation, packet building, transitions.
 * Renders: DoorScreen (presentational).
 */
export default function DoorShell() {
    const runMeta = getRunMeta();
    const dispatch = useAppDispatch();

    const light = runMeta.alignment.light;
    const dark = runMeta.alignment.dark;
    const depth = runMeta.depth;
    const maxDepth = 5;

    const packetRaw = localStorage.getItem("dudael:active_packet");
    const vesselId = (packetRaw ? JSON.parse(packetRaw)?.player?.vessel : "EXILE") as VesselId;
    const { lightCost, darkCost } = getDoorCosts(vesselId, depth);
    const secretThreshold = getSecretDoorThreshold(vesselId);

    const canLight = light >= lightCost;
    const canDark = dark >= darkCost;
    const canSecret = dark - light >= secretThreshold;
    const isMaxDepth = depth >= maxDepth;

    const handleChooseDoor = (path: "light" | "dark" | "secret") => {
        console.log(`🚪 Opening ${path.toUpperCase()} door. Continuing loop...`);

        const rawPacket = localStorage.getItem("dudael:active_packet");
        const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        const targetPhase = (isMaxDepth ? "07_drop" : "04_draft") as PhaseId;

        const updatedPacket = buildPacket("06_door", targetPhase, {
            ...packet,
            meta: { ...packet.meta, doorChosen: path },
        });

        dispatch(requestTransition(targetPhase, updatedPacket));
    };

    const handleForcedDrop = () => {
        console.log("☠️ No doors available. Forced Drop.");
        const rawPacket = localStorage.getItem("dudael:active_packet");
        const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        const updatedPacket = buildPacket("06_door", "07_drop", {
            ...packet,
            meta: { ...packet.meta, forcedDrop: true },
        });

        dispatch(requestTransition("07_drop", updatedPacket));
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
