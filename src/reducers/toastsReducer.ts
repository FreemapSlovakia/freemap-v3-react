import { createReducer } from '@reduxjs/toolkit';
import {
  ResolvedToast,
  toastsAdd,
  toastsRemove,
} from '../actions/toastsActions.js';

export interface ToastsState {
  toasts: ResolvedToast[];
}

const initialState: ToastsState = {
  toasts: [],
};

export const toastsReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(toastsAdd, (state, action) => {
      const { id } = action.payload;

      state.toasts = state.toasts.filter((toast) => toast.id !== id);

      state.toasts.push(action.payload);
    })
    .addCase(toastsRemove, (state, action) => {
      state.toasts = state.toasts.filter(({ id }) => id !== action.payload);
    }),
);
