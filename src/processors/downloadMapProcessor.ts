import { toastsAdd } from 'actions/toastsActions.js';
import { httpRequest } from 'httpRequest.js';
import { downloadMap, setActiveModal } from '../actions/mainActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
        messageKey: 'general.success', // TODO add specific message key for success
      }),
    );
  },
};
