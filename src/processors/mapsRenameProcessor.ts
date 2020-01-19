import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsRename, mapsLoadList } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { translate } from 'fm3/stringUtils';

export const mapsRenameProcessor: Processor<typeof mapsRename> = {
  actionCreator: mapsRename,
  errorKey: 'maps.renameError',
  handle: async ({ getState, dispatch }) => {
    const name = window.prompt(
      translate(window.translations as any, 'maps.namePrompt'),
    );

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

    dispatch(mapsLoadList());
  },
};
