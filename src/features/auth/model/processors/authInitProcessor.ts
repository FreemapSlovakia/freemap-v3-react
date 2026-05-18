import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
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
        if (typeof err !== 'object' || !err || 'status' in err) {
          throw err;
        }

        if (navigator.onLine) {
          throw err;
        }

        // offline — keep the cached user
        dispatch(authSetUser(user));
      }
    }
  },
};
