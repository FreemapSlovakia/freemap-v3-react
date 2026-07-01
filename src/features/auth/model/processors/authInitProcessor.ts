import { httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { loadAuthMessages } from '../../translations/loadAuthMessages.js';
import { authInit, authSetUser } from '../actions.js';
import {
  RawUserSchema,
  type User,
  type UserSettings,
  UserSettingsCompatSchema,
} from '../types.js';

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
  async handle({ getState, dispatch, toastError }) {
    try {
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
            const rawUser = RawUserSchema.parse(await res.json());

            let settings: UserSettings | undefined;

            const settingsResult = UserSettingsCompatSchema.safeParse(
              rawUser.settings,
            );

            if (settingsResult.success) {
              settings = settingsResult.data;
            } else {
              console.error('Invalid user settings:', settingsResult.error);
            }

            user = { ...rawUser, settings };
          } else {
            user = null;
          }

          dispatch(authSetUser(user));
        } catch (err) {
          // A network failure (offline, or the server unreachable) can't
          // disprove the cached session, so keep the user signed in silently;
          // only a real server/parse error surfaces.
          if (!isNetworkError(err)) {
            throw err;
          }

          dispatch(authSetUser(user));
        }
      }
    } catch (err) {
      await toastError(err, loadAuthMessages, 'verifyError', 'lcd');
    }
  },
};
