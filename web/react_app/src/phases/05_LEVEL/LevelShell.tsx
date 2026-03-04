import { getRunMeta } from "@du/phases";
import { buildWallPacket, type LevelToDoorWall } from "@du/phases/types";
import { VESSELS, getLevelCombatDeltas, type VesselId } from "@data/vessels/vessels";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { requestTransition } from "@/app/requestTransition";
import { selectRun, updateAlignment } from "@/app/runSlice";
import LevelScreen from "./LevelScreen";

/**
 * LevelShell — data + dispatch layer.
 * Owns: runMeta, vessel config, packet building, transition to Door.
 * Renders: LevelScreen (game logic + presentational).
 */
export default function LevelShell() {
    const runMeta = getRunMeta();
    const dispatch = useAppDispatch();
    const run = useAppSelector(selectRun);

    const depth = runMeta.progress.depth || 1;
    const vessel = runMeta.runner.vesselId?.toUpperCase() ?? "";
    const vesselId = (vessel || "EXILE") as VesselId;
    const combatDeltas = getLevelCombatDeltas(vesselId);
    const maxHealth = VESSELS[vesselId].maxHealth;

    const handleLevelComplete = (survived: boolean, points: number) => {
        const nextLight = survived ? 1 : 0;
        const nextDark = survived ? 0 : 1;

        dispatch(updateAlignment({ delta: { light: nextLight, dark: nextDark } }));

        const payload: LevelToDoorWall = {
            kind: "level->door",
            runId: run?.runId ?? runMeta.runId,
        };
        const wall = buildWallPacket("05_level", "06_door", payload);

        dispatch(requestTransition(wall));
    };

    return (
        <LevelScreen
            depth={depth}
            maxDepth={5}
            combatDeltas={combatDeltas}
            maxHealth={maxHealth}
            initialLight={runMeta.alignment.current.light}
            initialDark={runMeta.alignment.current.dark}
            onLevelComplete={handleLevelComplete}
        />
    );
}
