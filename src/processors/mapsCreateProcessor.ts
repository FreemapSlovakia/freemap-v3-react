import { mapsCreate, mapsLoad, mapsLoadList } from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';
import { getMapDataFromState } from './mapsSaveProcessor';

export const mapsCreateProcessor: Processor<typeof mapsCreate> = {
  actionCreator: mapsCreate,
  errorKey: 'maps.createError',
  handle: async ({ getState, dispatch }) => {
    const name = window.prompt(window.translations?.maps.namePrompt);

    if (name === null) {
      return;
    }

    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: '/maps/',
      expectedStatus: 200,
      data: {
        name,
        public: true, // TODO
        data: getMapDataFromState(getState()),
      },
    });

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.saved',
      }),
    );

    dispatch(mapsLoadList());

    const okData = assertType<{ id: number }>(data);

    dispatch(mapsLoad({ id: okData.id })); // TODO skip loading in this case
  },
};
