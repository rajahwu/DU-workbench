import { getRunMeta, buildPacket } from "@du/phases";
import { shouldIncrementMetaCounter, VESSELS, type VesselId } from "@data/vessels/vessels";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import DropScreen from "./DropScreen";

/**
 * DropShell — data + dispatch layer.
 * Owns: runMeta, packet reading, meta progression check, transition back to Staging.
 * Renders: DropScreen (presentational).
 */
export default function DropShell() {
    const runMeta = getRunMeta();
    const dispatch = useAppDispatch();

    const rawPacket = localStorage.getItem("dudael:active_packet");
    const packet = rawPacket ? JSON.parse(rawPacket) : null;
    const vesselId = (packet?.player?.vessel ?? "EXILE") as VesselId;
    const vesselConfig = VESSELS[vesselId];

    const levelResult = packet?.meta?.levelResult || { survived: false, points: 0 };
    const forcedDrop = packet?.meta?.forcedDrop;
    const survived = levelResult.survived && !forcedDrop;

    const metaIncremented = shouldIncrementMetaCounter(vesselId, {
        insight: runMeta?.insight ?? 0,
        currentLight: runMeta.alignment.light,
        currentDark: runMeta.alignment.dark,
    });

    const handleReturnToStaging = () => {
        console.log("♻️ Run concluded. Looping back to Staging...");

        const newPacket = buildPacket("07_drop", "03_staging", {
            user: packet?.user || { id: "guest", kind: "user" },
            player: packet?.player,
            meta: {
                previousRun: { depth: runMeta.depth, points: levelResult.points },
            },
        });

        dispatch(requestTransition("03_staging", newPacket));
    };

    return (
        <DropScreen
            runMeta={runMeta}
            survived={survived}
            levelResult={levelResult}
            vesselConfig={vesselConfig}
            metaIncremented={metaIncremented}
            onReturnToStaging={handleReturnToStaging}
        />
    );
}
