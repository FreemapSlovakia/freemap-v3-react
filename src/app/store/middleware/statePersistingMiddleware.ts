import { Middleware } from '@reduxjs/toolkit';
import storage from 'local-storage-fallback';
import { selectPersistedState } from '../persistence.js';
import type { RootState } from '../store.js';

export const statePersistingMiddleware: Middleware<{}, RootState> =
  ({ getState }) =>
  (next) =>
  (action) => {
    const result = next(action);

    const state = getState();

    if (state.cookieConsent.cookieConsentResult !== null) {
      persistSelectedState(state);
    }

    return result;
  };

function persistSelectedState(state: RootState) {
  if (window.fmEmbedded) {
    return;
  }

  // The selected subset + per-slice serialization lives in the `PERSIST` table
  // (persistence.ts), shared with `getInitialState`'s rehydration.
  storage.setItem('store', JSON.stringify(selectPersistedState(state)));
}
