// web/react_app/src/app/phaseSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {PhaseId, PhaseWallPayload, PhaseWallPacket } from "@du/phases/types";
import { buildWallPacket } from "@du/phases/types";
import { engineTransition } from "@du/phases/manager";

import {
  restoreSnapshot,
  hydrateFromSnapshot,
  getRunMeta,
  type RunMetaSnapshot,
} from "@du/phases/meta";

import type { AppDispatch, RootState } from "./store";

type PhaseState = {
  current: PhaseId;
  lastError?: string;
  meta: Readonly<RunMetaSnapshot>;
  wall: PhaseWallPacket | null;      // NEW: current PhaseWall inscription
};

const snap = restoreSnapshot();
if (snap) hydrateFromSnapshot(snap);

const initialState: PhaseState = {
  current:
    (snap?.phaseHistory?.[snap.phaseHistory.length - 1] as PhaseId) ??
    "01_title",
  meta: getRunMeta(),
  wall: null,
};

// main thunk used by phases

export function requestTransition(to: PhaseId, payload: PhaseWallPayload) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const from = getState().phase.current;

    // Build a minimal wall packet for this hop
    const wall: PhaseWallPacket = buildWallPacket(from, to, payload);

    const result = engineTransition(from, to, wall);

    if (!result.ok) {
      dispatch(transitionFailed(result.detail));
      return result;
    }

    dispatch(
      setPhaseAndWall({
        phase: result.phase,
        wall,
      }),
    );

    return result;
  };
}

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
