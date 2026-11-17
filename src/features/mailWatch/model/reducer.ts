import { authLogout } from '@features/auth/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  mailWatchKey,
  mailWatchSet,
  mailWatchToggle,
  mailWatchToggleDone,
} from './actions.js';

export interface MailWatchState {
  /**
   * By `mailWatchKey`: whose the state is (another user's must not show),
   * whether watched, and `busy` while a toggle is on its way.
   */
  byKey: Record<
    string,
    { userId: number; watching: boolean | null; busy: boolean }
  >;
}

const initialState: MailWatchState = { byKey: {} };

export const mailWatchReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(mailWatchSet, (state, { payload }) => {
      state.byKey[payload.key] = {
        userId: payload.userId,
        watching: payload.watching,
        busy: state.byKey[payload.key]?.busy ?? false,
      };
    })
    .addCase(mailWatchToggle, (state, { payload }) => {
      const key = mailWatchKey(payload);

      const entry = state.byKey[key];

      if (entry) {
        entry.busy = true;
      }
    })
    .addCase(mailWatchToggleDone, (state, { payload }) => {
      const entry = state.byKey[payload];

      if (entry) {
        entry.busy = false;
      }
    })
    .addCase(authLogout, () => initialState),
);
