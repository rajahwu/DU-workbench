// web/react_app/src/app/phaseSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PhaseId, PhaseWallPacket } from "@du/phases/types";

import {
  restoreSnapshot,
  hydrateFromSnapshot,
  getRunMeta,
  type RunMetaSnapshot,
} from "@du/phases/meta";

import type { RootState } from "./store";

type PhaseState = {
  current: PhaseId;
  lastError?: string;
  meta: Readonly<RunMetaSnapshot>;
  wall: PhaseWallPacket | null;      // NEW: current PhaseWall inscription
};

const snap = restoreSnapshot();
if (snap) hydrateFromSnapshot(snap);

const initialState: PhaseState = {
  current: (snap?.history.phaseTrail[snap.history.phaseTrail.length - 1] as PhaseId) ?? "01_title",
  meta: getRunMeta(),
  wall: null,
};

const slice = createSlice({
  name: "phase",
  initialState,
  reducers: {
    setPhaseAndWall(
      state,
      action: PayloadAction<{ phase: PhaseId; wall: PhaseWallPacket | null }>,
    ) {
      state.current = action.payload.phase;
      state.meta = getRunMeta();     // still sourced from engine/meta
      state.wall = action.payload.wall;
      state.lastError = undefined;
    },
    transitionFailed(state, action: PayloadAction<string>) {
      state.lastError = action.payload;
    },
    syncMeta(state) {
      state.meta = getRunMeta();
    },
  },
});

export const { setPhaseAndWall, transitionFailed, syncMeta } = slice.actions;
export const phaseReducer = slice.reducer;

// selectors
export const selectPhase = (s: RootState) => s.phase.current;
export const selectMeta = (s: RootState) => s.phase.meta;
export const selectPhaseError = (s: RootState) => s.phase.lastError;
export const selectWall = (s: RootState) => s.phase.wall;
