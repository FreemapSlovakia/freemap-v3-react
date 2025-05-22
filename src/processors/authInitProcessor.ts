import { get } from 'idb-keyval';
import { assert } from 'typia';
import { authInit, authSetUser } from '../actions/authActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { User } from '../types/auth.js';

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

export const authInitProcessor: Processor<typeof authInit> = {
  actionCreator: authInit,
  id: 'lcd',
  errorKey: 'auth.logIn.verifyError',
  async handle({ getState, dispatch, action }) {
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

        dispatch(authSetUser(ok ? assert<User>(await res.json()) : null));

        if (
          ok &&
          action.payload.becamePremium &&
          getState().auth.user?.isPremium // TODO else show error
        ) {
          dispatch(
            toastsAdd({
              style: 'success',
              messageKey: 'premium.success',
              timeout: 5000,
            }),
          );
        }
      } catch (err) {
        if (typeof err !== 'object' || !err || 'status' in err) {
          throw err;
        }

        const cm = await get('cacheMode');

        if (!cm || cm === 'networkOnly') {
          throw err;
        }

        dispatch(authSetUser(user));
      }
    }
  },
};
