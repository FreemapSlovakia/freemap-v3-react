import { get } from 'idb-keyval';
import { assert } from 'typia';
import { authInit, authSetUser } from '../actions/authActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';
import { User } from '../types/common.js';

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

        dispatch(
          authSetUser(
            res.status === 200 ? assert<User>(await res.json()) : null,
          ),
        );
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
