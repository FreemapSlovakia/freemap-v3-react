import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetPurchases } from '@features/auth/model/actions.js';
import { PurchasesResponse } from '@features/auth/model/types.js';
import { StringDates } from '@shared/types/common.js';
import { assert } from 'typia';

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

    const data = assert<StringDates<PurchasesResponse>>(await res.json());

    dispatch(
      authSetPurchases({
        purchases: data.purchases.map(({ createdAt, ...rest }) => ({
          ...rest,
          createdAt: new Date(createdAt),
        })),
        intents: data.intents.map(
          ({ createdAt, updatedAt, expireAt, ...rest }) => ({
            ...rest,
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
            expireAt: new Date(expireAt),
          }),
        ),
      }),
    );
  },
};
