import { Purchase } from 'types/auth.js';
import { StringDates } from 'types/common.js';
import { assert } from 'typia';
import { authSetPurchases } from '../actions/authActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const fetchPurchasesProcessor: Processor = {
  stateChangePredicate: (state) => state.main.activeModal,
  statePredicate: (state) => state.main.activeModal === 'account',
  // TODO errorKey: 'gallery.tagsFetchingError',
  async handle({ getState, dispatch }) {
    const res = await httpRequest({
      getState,
      url: '/auth/purchases',
      expectedStatus: 200,
    });

    const data = assert<StringDates<Purchase[]>>(await res.json());

    dispatch(
      authSetPurchases(
        data.map(({ createdAt, ...rest }) => ({
          ...rest,
          createdAt: new Date(createdAt),
        })),
      ),
    );
  },
};
