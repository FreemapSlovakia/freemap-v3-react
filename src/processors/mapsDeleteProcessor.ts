import {
  mapsDelete,
  mapsDisconnect,
  mapsLoadList,
} from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';

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
