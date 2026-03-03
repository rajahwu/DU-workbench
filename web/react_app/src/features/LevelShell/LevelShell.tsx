import { getRunMeta, buildPacket } from "@du/phases";
import { VESSELS, getLevelCombatDeltas, type VesselId } from "@data/vessels/vessels";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import LevelScreen from "./LevelScreen";

/**
 * LevelShell — data + dispatch layer.
 * Owns: runMeta, vessel config, packet building, transition to Door.
 * Renders: LevelScreen (game logic + presentational).
 */
export default function LevelShell() {
    const runMeta = getRunMeta();
    const dispatch = useAppDispatch();

    const depth = runMeta.depth || 1;
    const vessel = runMeta?.identity?.vessel?.toUpperCase() ?? "";
    const vesselId = (vessel || "EXILE") as VesselId;
    const combatDeltas = getLevelCombatDeltas(vesselId);
    const maxHealth = VESSELS[vesselId].maxHealth;

    const handleLevelComplete = (survived: boolean, points: number) => {
        const rawPacket = localStorage.getItem("dudael:active_packet");
        const packet = rawPacket ? JSON.parse(rawPacket) : { ts: Date.now() };

        const updatedPacket = buildPacket("05_level", "06_door", {
            ...packet,
            meta: {
                ...packet.meta,
                levelResult: { survived, points },
            },
        });
        dispatch(requestTransition("06_door", updatedPacket));
    };

    return (
        <LevelScreen
            depth={depth}
            maxDepth={5}
            combatDeltas={combatDeltas}
            maxHealth={maxHealth}
            initialLight={runMeta.alignment.light}
            initialDark={runMeta.alignment.dark}
            onLevelComplete={handleLevelComplete}
        />
    );
}
