import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import { mapsDelete, mapsDisconnect, mapsLoadList } from '../actions.js';

export const mapsDeleteProcessor: Processor<typeof mapsDelete> = {
  actionCreator: mapsDelete,
  handle: async ({
    getState,
    dispatch,
    action: { payload: id },
    toastError,
  }) => {
    trackMatomo(['trackEvent', 'MyMaps', 'delete']);

    try {
      await httpRequest({
        getState,
        method: 'DELETE',
        url: `/maps/${id}`,
        expectedStatus: 204,
      });
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'deleteError');

      return;
    }

    if (getState().myMaps.activeMap?.id === id) {
      dispatch(mapsDisconnect());
    }

    dispatch(mapsLoadList());

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.deleted',
      }),
    );
  },
};
