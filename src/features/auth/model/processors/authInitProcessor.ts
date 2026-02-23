import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { get } from 'idb-keyval';
import { assert, is } from 'typia';
import { httpRequest } from '@app/httpRequest.js';
import { upgradeCustomLayerDefs } from '../../../../mapDefinitions.js';
import { StringDates } from '../../../../types/common.js';
import { authInit, authSetUser } from '../actions.js';
import type { User, UserSettings } from '../types.js';

function track(id: number | undefined) {
  window._paq.push(
    id === undefined ? ['resetUserId'] : ['setUserId', String(id)],
  );

  window._paq.push(['trackPageView']);

  window._paq.push(['appendToTrackingUrl', '']);
}

export const authTrackProcessor: Processor = {
  stateChangePredicate: (state) => state.auth.user?.id,
  handle({ getState }) {
    track(getState().auth.user?.id);
  },
};

export const authInitProcessor: Processor = {
  actionCreator: authInit,
  id: 'lcd',
  errorKey: 'auth.logIn.verifyError',
  async handle({ getState, dispatch }) {
    const { user } = getState().auth;

    track(user?.id);

    if (user) {
      try {
        const res = await httpRequest({
          getState,
          url: '/auth/validate',
          method: 'POST',
          expectedStatus: [200, 401],
          cancelActions: [],
        });

        const ok = res.status === 200;

        let user: User | null;

        if (ok) {
          const rawUser = assert<
            StringDates<Omit<User, 'settings'>> & { settings?: unknown }
          >(await res.json());

          let settings: UserSettings | undefined;

          if (is<{ customLayers: unknown[] }>(rawUser.settings)) {
            rawUser.settings.customLayers = upgradeCustomLayerDefs(
              rawUser.settings.customLayers,
            );
          }

          try {
            settings = assert<UserSettings>(rawUser.settings);
          } catch (e) {
            console.error('Invalid user settings:', e);

            settings = undefined;
          }

          user = {
            ...rawUser,
            settings,
            premiumExpiration:
              rawUser.premiumExpiration === null
                ? null
                : new Date(rawUser.premiumExpiration),
          };
        } else {
          user = null;
        }

        dispatch(authSetUser(user));
      } catch (err) {
        if (typeof err !== 'object' || !err || 'status' in err) {
          throw err;
        }

        const cm = await get('cacheMode');

        if (!cm || cm === 'networkOnly' || cm === 'networkFirst') {
          throw err;
        }

        dispatch(authSetUser(user));
      }
    }
  },
};
