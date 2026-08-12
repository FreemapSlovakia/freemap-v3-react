import { createReducer } from '@reduxjs/toolkit';
import { startProgress, stopProgress } from './actions.js';

export type ProgressState = Array<string | number>;

export const progressInitialState: ProgressState = [];

export const progressReducer = createReducer(progressInitialState, (builder) =>
  builder
    .addCase(startProgress, (state, action) => {
      state.push(action.payload);
    })
    // Drops one entry, not every match: a named pid (one a component watches to
    // know that particular operation is running) is held once per run, so two
    // overlapping runs have to be counted rather than cleared by the first to
    // finish. Random pids are unique, so for them this is the same removal.
    .addCase(stopProgress, (state, action) => {
      const i = state.indexOf(action.payload);

      return i < 0 ? state : [...state.slice(0, i), ...state.slice(i + 1)];
    }),
);
