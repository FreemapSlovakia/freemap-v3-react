import { createReducer } from '@reduxjs/toolkit';
import {
  type ResolvedToast,
  toastsAdd,
  toastsRemove,
  toastsRestartTimeout,
  toastsSetPinned,
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

      // A re-raised toast stays killed — the payload always arrives unpinned,
      // and cancelling the countdown is one way, so there is nothing to weigh
      // against carrying it over.
      const pinned = state.toasts[id]?.pinned ?? false;

      // to reorder existing
      delete state.toasts[id];

      state.toasts[id] = pinned
        ? { ...payload, pinned: true, timeoutSince: undefined }
        : payload;
    })
    .addCase(toastsRemove, (state, { payload }) => {
      delete state.toasts[payload];
    })
    // A pointer leaving, or a click landing, can outlive the toast by a frame:
    // the removal is dispatched, the event arrives before the render drops the
    // element. So each of these tolerates the toast already being gone.
    .addCase(toastsStopTimeout, (state, { payload }) => {
      const toast = state.toasts[payload];

      if (toast) {
        toast.timeoutSince = undefined;
      }
    })
    .addCase(toastsRestartTimeout, (state, { payload }) => {
      const toast = state.toasts[payload.id];

      if (toast) {
        toast.timeoutSince = payload.timeoutSince;
      }
    })
    .addCase(toastsSetPinned, (state, { payload }) => {
      const toast = state.toasts[payload.id];

      if (toast) {
        toast.pinned = payload.pinned;
      }
    }),
);
