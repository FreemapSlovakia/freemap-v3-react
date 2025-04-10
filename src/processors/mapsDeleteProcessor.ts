import {
  mapsDelete,
  mapsDisconnect,
  mapsLoadList,
} from '../actions/mapsActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';

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
