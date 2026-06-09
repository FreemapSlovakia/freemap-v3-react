import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { mapsDelete, mapsDisconnect, mapsLoadList } from '../actions.js';

export const mapsDeleteProcessor: Processor<typeof mapsDelete> = {
  actionCreator: mapsDelete,
  errorKey: 'myMaps.deleteError',
  handle: async ({ getState, dispatch, action: { payload: id } }) => {
    window._paq.push(['trackEvent', 'MyMaps', 'delete']);

    await httpRequest({
      getState,
      method: 'DELETE',
      url: `/maps/${id}`,
      expectedStatus: 204,
    });

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
