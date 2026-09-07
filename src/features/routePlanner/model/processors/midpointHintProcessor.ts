import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { askingCookieConsentSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { applyCookieConsent } from '@features/cookieConsent/model/actions.js';
import { COOKIE_CONSENT_TOAST_ID } from '@features/cookieConsent/model/toastAction.js';
import {
  type ToastAction,
  toastsAdd,
  toastsRemove,
} from '@features/toasts/model/actions.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import type { Dispatch } from 'redux';
import { loadRoutePlannerMessages } from '../../translations/loadRoutePlannerMessages.js';
import { routePlannerAddPoint, routePlannerPreventHint } from '../actions.js';

const HINT_TOAST_ID = 'routePlanner.showMidpointHint';

/** Set when the cookie bar swallowed a hint a planned route had earned. */
let deferred = false;

function hintApplies(state: RootState): boolean {
  const { transportType, mode } = state.routePlanner;

  return (
    !(transportTypeDefs[transportType]?.api === 'gh' && mode !== 'route') &&
    !state.routePlannerSettings.preventHint
  );
}

function hintToast(state: RootState) {
  const actions: ToastAction[] = [{ nameKey: 'general.ok' }];

  // Nothing is persisted until the cookie bar is answered, so the offer to stop
  // asking is only made where the choice can be stored.
  if (state.cookieConsent.cookieConsentResult !== null) {
    actions.push({
      nameKey: 'general.preventShowingAgain',
      action: routePlannerPreventHint(),
      variant: 'dark',
    });
  }

  return toastsAdd({
    id: HINT_TOAST_ID,
    messageKey: 'showMidpointHint',
    messageLoader: loadRoutePlannerMessages,
    style: 'info',
    actions,
    cancelType: routePlannerAddPoint.type,
    statePredicate: (state) => state.main.mapTool !== 'route-planner',
  });
}

/** Raises the hint, or holds it back until the cookie bar goes. */
export function raiseMidpointHint(state: RootState, dispatch: Dispatch): void {
  if (!hintApplies(state)) {
    return;
  }

  if (askingCookieConsentSelector(state)) {
    deferred = true;
  } else {
    dispatch(hintToast(state));
  }
}

/**
 * Raises what the cookie bar swallowed, once it goes. Accepting consent removes
 * the bar before recording the answer, so both are watched: the second raise
 * replaces the standing hint, adding "don't show again".
 */
export const routePlannerMidpointHintProcessor: Processor = {
  actionCreator: [toastsRemove, applyCookieConsent],
  actionPredicate: (action) =>
    !toastsRemove.match(action) || action.payload === COOKIE_CONSENT_TOAST_ID,
  statePredicate: (state) => !askingCookieConsentSelector(state),
  handle: async ({ dispatch, getState, action }) => {
    const state = getState();

    // The bar is gone: a hint not owed now is never owed, so the note goes
    // whether or not it is honoured.
    const owed = deferred;

    deferred = false;

    if (
      (owed ||
        (applyCookieConsent.match(action) &&
          HINT_TOAST_ID in state.toasts.toasts)) &&
      state.main.mapTool === 'route-planner' &&
      // What the route the hint was meant for leaves standing: two ends, no
      // midpoint yet.
      state.routePlanner.points.length === 2 &&
      hintApplies(state)
    ) {
      dispatch(hintToast(state));
    }
  },
};
