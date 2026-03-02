// web/react_app/src/app/phaseSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PhaseId, PhasePacket } from "@du/phases";
import { transition as engineTransition } from "@du/phases";
import { restoreSnapshot, hydrateFromSnapshot, getRunMeta } from "@du/phases/meta";
import type { AppDispatch, RootState } from "./store";

type PhaseState = {
  current: PhaseId;
  lastError?: string;
  // keep the meta snapshot here so UI can read it easily
  meta: ReturnType<typeof getRunMeta>;
};

const snap = restoreSnapshot();
if (snap) hydrateFromSnapshot(snap);

const initialState: PhaseState = {
  current: (snap?.phaseHistory?.[snap.phaseHistory.length - 1] as PhaseId) ?? "01_title",
  meta: getRunMeta(),
};

const slice = createSlice({
  name: "phase",
  initialState,
  reducers: {
    setPhase(state, action: PayloadAction<PhaseId>) {
      state.current = action.payload;
      state.meta = getRunMeta();
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

export const { setPhase, transitionFailed, syncMeta } = slice.actions;
export const phaseReducer = slice.reducer;

// selectors
export const selectPhase = (s: RootState) => s.phase.current;
export const selectMeta = (s: RootState) => s.phase.meta;
export const selectPhaseError = (s: RootState) => s.phase.lastError;

/**
 * The main thunk you will use everywhere instead of calling engineTransition directly.
 */
export function requestTransition(to: PhaseId, packet?: Partial<PhasePacket>) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const from = getState().phase.current;

    const fullPacket: PhasePacket | undefined = packet
      ? ({
          from,
          to,
          ts: Date.now(),
          ...packet,
        } as PhasePacket)
      : undefined;

    const result = engineTransition(from, to, fullPacket);

    if (!result.ok) {
      dispatch(transitionFailed(result.detail));
      return result;
    }

    dispatch(setPhase(result.phase));
    dispatch(syncMeta());

    return result;
  };
}
