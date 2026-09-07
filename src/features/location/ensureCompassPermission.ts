import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from '@reduxjs/toolkit';
import {
  isCompassPermissionRequired,
  requestCompassPermission,
} from './compass.js';
import { locationSetHeadingSource } from './model/actions.js';

/**
 * Re-acquires the orientation grant from whatever user gesture is at hand.
 *
 * iOS drops the grant between page loads while the preference survives in
 * localStorage, so a stored `compass` choice would otherwise be dead on every
 * fresh visit — no events, just the "no compass data" toast — until the user
 * happened to reopen the preferences. Call this from any gesture that means the
 * user wants the compass now.
 *
 * A refusal downgrades the preference: `requestPermission` keeps returning
 * `denied` without re-prompting, so leaving `compass` selected would sit there
 * silently dead and re-toast on every locate.
 */
export function ensureCompassPermission(dispatch: Dispatch): void {
  // Nothing to ask for off iOS, and asking anyway would misread the "device has
  // no compass" answer `requestCompassPermission` falls back to as a refusal —
  // downgrading the preference and blaming the user for a prompt never shown.
  if (!isCompassPermissionRequired()) {
    return;
  }

  requestCompassPermission().then((granted) => {
    if (granted) {
      return;
    }

    dispatch(locationSetHeadingSource('gps'));

    dispatch(
      toastsAdd({
        id: 'main.compassPermissionDenied',
        messageKey: 'main.compassPermissionDenied',
        style: 'warning',
        timeout: 5000,
      }),
    );
  });
}
