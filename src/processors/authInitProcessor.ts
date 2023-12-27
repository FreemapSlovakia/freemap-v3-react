import { authInit, authSetUser } from 'fm3/actions/authActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { get } from 'idb-keyval';
import { assert } from 'typia';

export const authTrack: Processor = {
  stateChangePredicate: (state) => state.auth.user?.id,
  handle({ getState }) {
    const id = getState().auth.user?.id;

    window._paq.push(
      id === undefined ? ['resetUserId'] : ['setUserId', String(id)],
    );
  },
};

export const authInitProcessor: Processor = {
  actionCreator: authInit,
  errorKey: 'logIn.verifyError',
  async handle({ getState, dispatch }) {
    const { user } = getState().auth;

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
