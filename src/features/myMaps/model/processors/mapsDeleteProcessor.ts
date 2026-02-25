import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { mapsDelete, mapsDisconnect, mapsLoadList } from '../actions.js';

export const mapsDeleteProcessor: Processor<typeof mapsDelete> = {
  actionCreator: mapsDelete,
  errorKey: 'maps.deleteError',
  handle: async ({ getState, dispatch, action: { payload: id } }) => {
    await httpRequest({
      getState,
      method: 'DELETE',
      url: `/maps/${id}`,
      expectedStatus: 204,
    });

    if (getState().maps.activeMap?.id === id) {
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
