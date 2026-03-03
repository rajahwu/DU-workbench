import { useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { requestTransition } from "@/app/phaseSlice";
import { type VesselId, buildVesselPacketStats } from "@data/vessels/vessels";
import { type VesselDataRecordKey, VESSEL_DATA as vesselData } from "@data/vessels/data";
import type { GateSelection, DescentGuide, DescentMode, EngineVesselId } from "@du/phases";
import { buildPacket } from "@du/phases";
import SelectScreen from "./SelectScreen";

export type GateStep = 0 | 1 | 2;

/**
 * SelectShell — data + dispatch layer.
 * Owns: Gate step state, vessel locking, packet building, transition.
 * Renders: SelectScreen (presentational).
 */
export default function SelectShell() {
    const [step, setStep] = useState<GateStep>(0);
    const [gate, setGate] = useState<GateSelection>({});
    const [activeVesselId, setActiveVesselId] = useState<VesselDataRecordKey>("seraph");
    const dispatch = useAppDispatch();

    const handleGuide = (guide: DescentGuide) => {
        setGate((prev) => ({ ...prev, guide }));
        setStep(1);
    };

    const handleMode = (mode: DescentMode) => {
        setGate((prev) => ({ ...prev, mode }));
        setStep(2);
    };

    const handleLockVessel = () => {
        const engineId = activeVesselId.toUpperCase() as VesselId;
        const vesselKey = activeVesselId as EngineVesselId;
        const activeData = vesselData[activeVesselId];
        console.log(`Locking in vessel: ${activeData.name}`);

        const rawPacket = localStorage.getItem("dudael:active_packet");
        const prev = rawPacket
            ? JSON.parse(rawPacket)
            : { ts: Date.now(), user: { id: "guest", kind: "user" } };

        const stats = buildVesselPacketStats(engineId);
        const finalGate: GateSelection = { ...gate, vesselId: vesselKey };

        const updatedPacket = buildPacket("02_select", "03_staging", {
            ...prev,
            gate: finalGate,
            player: { ...(prev.player || {}), vessel: engineId, stats },
        });

        dispatch(requestTransition("03_staging", updatedPacket));
    };

    const handleBack = () => {
        if (step === 1) {
            setGate((prev) => ({ ...prev, guide: undefined }));
            setStep(0);
        }
        if (step === 2) {
            setGate((prev) => ({ ...prev, mode: undefined }));
            setStep(1);
        }
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
            onSelectVessel={setActiveVesselId}
        />
    );
}
