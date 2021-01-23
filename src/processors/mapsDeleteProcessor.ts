import { deleteFeature } from 'fm3/actions/mainActions';
import { mapsLoad, mapsLoadList } from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapsDeleteProcessor: Processor<typeof deleteFeature> = {
  actionCreator: deleteFeature,
  errorKey: 'maps.deleteError',
  handle: async ({ getState, dispatch }) => {
    if (
      getState().main.tool !== 'maps' ||
      !window.confirm(window.translations?.maps.deleteConfirm)
    ) {
      return;
    }

    await httpRequest({
      getState,
      method: 'DELETE',
      url: `/maps/${getState().maps.id}`,
      expectedStatus: 204,
    });

    dispatch(mapsLoad({}));

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
