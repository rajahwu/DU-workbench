// web/react_app/src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { phaseReducer } from "./phaseSlice";
import { runReducer } from "./runSlice";

export const store = configureStore({
  reducer: {
    phase: phaseReducer,
    run: runReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
