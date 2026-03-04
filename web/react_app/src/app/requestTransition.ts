// app/requestTransition.ts
import type { AppDispatch, RootState } from "./store";
import { setPhaseAndWall, transitionFailed } from "./phaseSlice";
import {
    selectRun,
    advanceDepth,
    recordPhase,
    recordDoorChoice,
    recordDrop,
    addMemoryFragments,
} from "./runSlice";
import type { PhaseWallPacket, PhaseId } from "@du/phases/types";
import { engineTransition } from "@du/phases"; // your existing pure engine fn
import { saveCheckpoint } from "./checkpoint";

export function requestTransition(wall: PhaseWallPacket) {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState();
        const from: PhaseId = state.phase.current;

        // 1) Guard: wall.fromPhase must match current phase
        if (from !== wall.fromPhase) {
            dispatch(
                transitionFailed(
                    `Illegal transition: wall.fromPhase=${wall.fromPhase} but current=${from}`,
                ),
            );
            return;
        }

        // 2) Let engine validate legality and compute next phase
        const result = engineTransition(from, wall.toPhase, wall);
        if (!result.ok) {
            dispatch(transitionFailed(result.detail ?? "Transition blocked"));
            return;
        }

        const nextPhase = result.phase as PhaseId;

        // 3) Apply run side-effects based on this hop
        const run = selectRun(getState());
        if (run) {
            // record phase history
            dispatch(recordPhase(nextPhase));

            switch (wall.payload.kind) {
                case "select->staging": {
                    // Example: you might set starting alignment here later
                    break;
                }
                case "draft->level": {
                    // maybe advance depth before entering level
                    dispatch(advanceDepth());
                    break;
                }
                case "level->door": {
                    // alignment deltas from level already applied in Level via updateAlignment
                    break;
                }
                case "door->drop": {
                    if (wall.payload.doorChoice) {
                        dispatch(recordDoorChoice(wall.payload.doorChoice));
                    }
                    if (wall.payload.dropReason) {
                        dispatch(recordDrop(wall.payload.dropReason));
                    }
                    break;
                }
                case "door->draft":
                case "door->staging": {
                    if (wall.payload.doorChoice) {
                        dispatch(recordDoorChoice(wall.payload.doorChoice));
                    }
                    break;
                }
                case "drop->staging": {
                    if (wall.payload.dropReason) {
                        dispatch(recordDrop(wall.payload.dropReason));
                    }
                    // Example: reward fragments on death
                    if (wall.payload.dropReason === "death") {
                        dispatch(addMemoryFragments(5));
                    }
                    break;
                }
                default:
                    break;
            }
        }

        // 4) Commit new phase + wall into Redux
        dispatch(
            setPhaseAndWall({
                phase: nextPhase,
                wall,
            }),
        );

        const latest = getState();
        saveCheckpoint(latest.run, {
            current: latest.phase.current,
            wall: latest.phase.wall,
        });

        // 5) Optional: checkpoint for recovery
        // persistRunAndPhase(getState().run, { phase: nextPhase, wall });
    };
}
