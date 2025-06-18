import { get } from 'idb-keyval';
import { assert } from 'typia';
import { authInit, authSetUser } from '../actions/authActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { User } from '../types/auth.js';
import { StringDates } from '../types/common.js';

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
          const rawUser = assert<StringDates<User>>(await res.json());

          user = {
            ...rawUser,
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
