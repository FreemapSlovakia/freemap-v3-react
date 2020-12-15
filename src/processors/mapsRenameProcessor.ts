import { mapsLoadList, mapsRename } from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapsRenameProcessor: Processor<typeof mapsRename> = {
  actionCreator: mapsRename,
  errorKey: 'maps.renameError',
  handle: async ({ getState, dispatch }) => {
    const name = window.prompt(window.translations?.maps.namePrompt);

    if (name === null) {
      return;
    }

    await httpRequest({
      getState,
      method: 'PATCH',
      url: `/maps/${getState().maps.id}`,
      expectedStatus: 204,
      data: {
        name,
      },
    });

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.saved', // TODO
      }),
    );

    dispatch(mapsLoadList());
  },
};
