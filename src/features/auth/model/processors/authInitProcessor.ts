import { httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadAuthMessages } from '../../translations/loadAuthMessages.js';
import { authInit, authSetUser } from '../actions.js';
import {
  RawUserSchema,
  type User,
  type UserSettings,
  UserSettingsCompatSchema,
} from '../types.js';

function track(id: number | undefined) {
  trackMatomo(id === undefined ? ['resetUserId'] : ['setUserId', String(id)]);

  trackMatomo(['trackPageView']);

  trackMatomo(['appendToTrackingUrl', '']);
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
          // Neither a network failure (offline, or the server unreachable) nor a
          // server/parse error can disprove the cached session, so it stands
          // either way; only the latter is worth reporting. Resolving the check
          // is what matters: everything that waits for `auth.validated` — loading
          // and restoring a map — resumes only once it is set, and a failure that
          // left it unset would hold the map open forever.
          dispatch(authSetUser(user));

          if (!isNetworkError(err)) {
            await toastError(err, loadAuthMessages, 'verifyError', 'lcd');
          }
        }
      }
    } catch (err) {
      await toastError(err, loadAuthMessages, 'verifyError', 'lcd');
    }
  },
};
