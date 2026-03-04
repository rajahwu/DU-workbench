import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectRun, lockGate } from "@/app/runSlice";
import { requestTransition } from "@/app/requestTransition";
import {
    buildWallPacket,
    PhaseWallPacket,
    SelectToStagingWall,
    GateChoice,
} from "@du/phases/types";
import type { VesselDataRecordKey } from "@data/vessels/data";
import SelectScreen from "./SelectScreen";

export type GateStep = 0 | 1 | 2;

export default function SelectShell() {
    const dispatch = useAppDispatch();
    const run = useAppSelector(selectRun);
    const [step, setStep] = useState<GateStep>(0);
    const [activeVesselId, setActiveVesselId] = useState<VesselDataRecordKey>("seraph");
    const [gate, setGate] = useState<{
        guide?: Required<GateChoice>["guide"];
        mode?: Required<GateChoice>["mode"];
        vesselId?: Required<GateChoice>["vesselId"];
    }>({});

    const handleGuide = (guide: Required<GateChoice>["guide"]) => {
        setGate((prev) => ({ ...prev, guide }));
        setStep(1);
    };

    const handleMode = (mode: Required<GateChoice>["mode"]) => {
        setGate((prev) => ({ ...prev, mode }));
        setStep(2);
    };

    const handleBack = () => {
        setStep((prev) => (prev === 0 ? 0 : ((prev - 1) as GateStep)));
    };

    const handleSelectVessel = (id: VesselDataRecordKey) => {
        setActiveVesselId(id);
        setGate((prev) => ({ ...prev, vesselId: id }));
    };

    const handleLockVessel = () => {
        const choice = gate as Required<GateChoice>;
        if (!choice.guide || !choice.mode || !choice.vesselId) {
            return;
        }

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
    };

    return (
        <SelectScreen
            step={step}
            gate={gate}
            activeVesselId={activeVesselId}
            onGuide={handleGuide}
            onMode={handleMode}
            onLockVessel={handleLockVessel}
            onBack={handleBack}
            onSelectVessel={handleSelectVessel}
        />
    );
}
