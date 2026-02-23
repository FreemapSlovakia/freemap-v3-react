import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetPurchases } from '@features/auth/model/actions.js';
import { PurchaseRecord } from '@features/auth/model/types.js';
import { StringDates } from '@shared/types/common.js';
import { assert } from 'typia';
import { httpRequest } from '../app/httpRequest.js';

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

    const data = assert<StringDates<PurchaseRecord[]>>(await res.json());

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
