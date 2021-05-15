import { mapsDelete, mapsLoad, mapsLoadList } from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapsDeleteProcessor: Processor<typeof mapsDelete> = {
  actionCreator: mapsDelete,
  errorKey: 'maps.deleteError',
  handle: async ({ getState, dispatch, action }) => {
    if (!window.confirm(window.translations?.maps.deleteConfirm)) {
      return;
    }

    await httpRequest({
      getState,
      method: 'DELETE',
      url: `/maps/${action.payload}`,
      expectedStatus: 204,
    });

    if (getState().maps.id === action.payload) {
      dispatch(mapsLoad({})); // detach
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
