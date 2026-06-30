import { Middleware } from '@reduxjs/toolkit';
import storage from 'local-storage-fallback';
import { selectPersistedState } from '../persistence.js';
import type { RootState } from '../store.js';

// Latched on once a full app reset + reload is initiated. The reset clears the
// persisted `store` key and reloads; without this, a background action (tracking
// message, geolocation update) dispatched in the gap before the page unloads
// would re-persist the state and silently defeat the reset.
let suspended = false;

/** Permanently stops state persistence for the rest of this page's lifetime. */
export function suspendStatePersistence(): void {
  suspended = true;
}

export const statePersistingMiddleware: Middleware<{}, RootState> =
  ({ getState }) =>
  (next) =>
  (action) => {
    const result = next(action);

    const state = getState();

    if (!suspended && state.cookieConsent.cookieConsentResult !== null) {
      persistSelectedState(state);
    }

    return result;
  };

let persistFailureReported = false;

function persistSelectedState(state: RootState) {
  if (window.fmEmbedded) {
    return;
  }

  // The selected subset + per-slice serialization lives in the `PERSIST` table
  // (persistence.ts), shared with `getInitialState`'s rehydration.
  try {
    storage.setItem('store', JSON.stringify(selectPersistedState(state)));
  } catch (error) {
    // This write runs after `next(action)`, so a throw here propagates into
    // errorHandlingMiddleware, which dispatches an action that re-enters this
    // middleware and throws again — an infinite reducer-error loop that freezes
    // the app. A failing persist (storage blocked, quota exceeded) must degrade
    // silently instead. Report it once, out-of-band, so it never re-dispatches.
    if (!persistFailureReported) {
      persistFailureReported = true;

      console.error('Failed to persist state', error);

      window.Sentry?.captureException(error);
    }
  }
}
