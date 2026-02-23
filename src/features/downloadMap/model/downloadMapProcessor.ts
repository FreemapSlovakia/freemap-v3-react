import { setActiveModal } from '../../../actions/mainActions.js';
import { downloadMap } from './actions.js';
import { toastsAdd } from '../../toasts/model/actions.js';
import { httpRequest } from '../../../httpRequest.js';
import type { Processor } from '../../../middlewares/processorMiddleware.js';

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
