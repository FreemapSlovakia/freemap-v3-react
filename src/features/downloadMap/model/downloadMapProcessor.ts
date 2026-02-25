import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { downloadMap } from './actions.js';

export const downloadMapProcessor: Processor<typeof downloadMap> = {
  actionCreator: downloadMap,
  async handle({ dispatch, getState, action }) {
    await httpRequest({
      getState,
      method: 'POST',
      url: '/downloadMap',
      expectedStatus: 204,
      data: action.payload,
    });

    dispatch(setActiveModal(null));

    dispatch(
      toastsAdd({
        style: 'success',
        messageKey: 'downloadMap.success',
      }),
    );
  },
};
