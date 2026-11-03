import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { homeLocationSent, saveHomeLocation } from './actions.js';

/**
 * Sends a change made here to the account — at once when logged in, else on
 * the next login, where it overrides what the account holds.
 */
export const homeLocationSyncProcessor: Processor = {
  actionCreator: [saveHomeLocation, authSetUser],
  async handle({ getState, dispatch, action, toastError }) {
    if (saveHomeLocation.match(action)) {
      trackMatomo([
        'trackEvent',
        'HomeLocation',
        action.payload ? 'save' : 'remove',
      ]);
    }

    const { homeLocation, unsent } = getState().homeLocation;

    if (!unsent || !getState().auth.user) {
      return;
    }

    try {
      await httpRequest({
        getState,
        method: 'PATCH',
        url: '/auth/settings',
        expectedStatus: 204,
        data: {
          lat: homeLocation?.lat ?? null,
          lon: homeLocation?.lon ?? null,
        },
      });

      dispatch(homeLocationSent(homeLocation));
    } catch (err) {
      // Kept unsent, so the next start or login tries again.
      if (saveHomeLocation.match(action)) {
        await toastError(err, loadMapSettingsMessages, 'savingError');
      } else {
        console.warn('Sending the home location to the account failed:', err);
      }
    }
  },
};
