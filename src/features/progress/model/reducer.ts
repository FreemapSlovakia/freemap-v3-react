import { createReducer } from '@reduxjs/toolkit';
import { startProgress, stopProgress } from './actions.js';

export type ProgressState = Array<string | number>;

export const progressInitialState: ProgressState = [];

export const progressReducer = createReducer(progressInitialState, (builder) =>
  builder
    .addCase(startProgress, (state, action) => {
      state.push(action.payload);
    })
    .addCase(stopProgress, (state, action) =>
      state.filter((pid) => pid !== action.payload),
    ),
);
