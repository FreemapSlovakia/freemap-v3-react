import { createReducer } from '@reduxjs/toolkit';
import {
  ResolvedToast,
  toastsAdd,
  toastsRemove,
  toastsRestartTimeout,
  toastsStopTimeout,
} from './actions.js';

export interface ToastsState {
  toasts: Record<string, ResolvedToast>;
}

const initialState: ToastsState = {
  toasts: {},
};

export const toastsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(toastsAdd, (state, { payload }) => {
      const { id } = payload;

      // to reorder existing
      delete state.toasts[id];

      state.toasts[id] = payload;
    })
    .addCase(toastsRemove, (state, { payload }) => {
      delete state.toasts[payload];
    })
    .addCase(toastsStopTimeout, (state, { payload }) => {
      state.toasts[payload].timeoutSince = undefined;
    })
    .addCase(toastsRestartTimeout, (state, { payload }) => {
      state.toasts[payload.id].timeoutSince = payload.timeoutSince;
    }),
);
