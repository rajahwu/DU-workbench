// app/runSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RunLedger, GateChoice, Alignment, PhaseId } from "@du/phases/types";
import type { RootState } from "./store";

export type RunState = RunLedger | null;

const initialState: RunState = null;

import { getRunMeta, type RunMetaSnapshot } from "@du/phases/meta";

export function hydrateRunFromEngineMeta(): RunLedger | null {
    const meta: RunMetaSnapshot = getRunMeta();
    if (!meta.runId) return null;

    return {
        runId: meta.runId,
        runner: {
            runnerId: meta.runId,
            userId: meta.runner.userId,
            displayName: undefined,
            vesselId: meta.runner.vesselId,
            sigilKey: meta.runner.sigilKey,
        },
        gateLock: meta.gateLock,
        progress: meta.progress,
        alignment: meta.alignment,
        inventory: meta.inventory,
        history: meta.history,
        metaFlags: meta.metaFlags,
        telemetry: { totalClicks: 0, totalRuns: 0 },
        debugTrace: {},
    };
}

const runSlice = createSlice({
    name: "run",
    initialState,
    reducers: {
        initRun(state, action: PayloadAction<{ runId: string; runner: RunLedger["runner"] }>) {
            return {
                runId: action.payload.runId,
                runner: action.payload.runner,
                gateLock: undefined,
                progress: { depth: 0, loopCount: 0 },
                alignment: { current: { light: 0, dark: 0 } },
                inventory: { memoryFragments: 0, relicIds: [], draftCardIds: [] },
                history: { phaseTrail: [] },
                metaFlags: { penitentInsight: 0, rebelBreaches: 0, unlockedCodexKeys: [] },
                telemetry: { totalClicks: 0, totalRuns: 0 },
                debugTrace: {},
            };
        },

        lockGate(state, action: PayloadAction<{ choice: Required<GateChoice>; lockedAt: PhaseId }>) {
            if (!state) return;
            state.gateLock = {
                guide: action.payload.choice.guide,
                mode: action.payload.choice.mode,
                vesselId: action.payload.choice.vesselId,
                lockedAt: action.payload.lockedAt,
            };
            state.runner.vesselId = action.payload.choice.vesselId;
        },

        updateAlignment(state, action: PayloadAction<{ delta: Alignment }>) {
            if (!state) return;
            state.alignment.current.light += action.payload.delta.light;
            state.alignment.current.dark += action.payload.delta.dark;
        },

        advanceDepth(state) {
            if (!state) return;
            state.progress.depth += 1;
        },

        recordPhase(state, action: PayloadAction<PhaseId>) {
            if (!state) return;
            state.history.phaseTrail.push(action.payload);
        },

        recordDoorChoice(
            state,
            action: PayloadAction<"light" | "dark" | "secret">
        ) {
            if (!state) return;
            state.history.lastDoorChoice = action.payload;
        },

        recordDrop(
            state,
            action: PayloadAction<"death" | "math_fail" | "exit">
        ) {
            if (!state) return;
            state.history.lastDropReason = action.payload;
            state.progress.loopCount += 1;
        },

        addMemoryFragments(state, action: PayloadAction<number>) {
            if (!state) return;
            state.inventory.memoryFragments += action.payload;
        },

        setDraftCards(state, action: PayloadAction<string[]>) {
            if (!state) return;
            state.inventory.draftCardIds = action.payload;
        },

        hydrateRun(_state, action: PayloadAction<RunLedger>) {
            return action.payload;
        },

        clearRun() {
            return null;
        },
    },
});

export const {
    initRun,
    lockGate,
    updateAlignment,
    advanceDepth,
    recordPhase,
    recordDoorChoice,
    recordDrop,
    addMemoryFragments,
    setDraftCards,
    hydrateRun,
    clearRun,
} = runSlice.actions;

export const runReducer = runSlice.reducer;

// Selectors
export const selectRun = (state: RootState) => state.run;
export const selectRunner = (state: RootState) => state.run?.runner ?? null;
export const selectGateLock = (state: RootState) => state.run?.gateLock ?? null;
export const selectAlignment = (state: RootState) => state.run?.alignment.current ?? null;
