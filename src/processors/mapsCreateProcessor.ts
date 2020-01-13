import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsCreate, mapsLoad } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';

export const mapsCreateProcessor: Processor<typeof mapsCreate> = {
  actionCreator: mapsCreate,
  errorKey: 'maps.createError',
  handle: async ({ getState, dispatch }) => {
    const name = window.prompt('Name?');

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
        data: {
          lines: getState().drawingLines.lines,
        },
      },
    });

    dispatch(mapsLoad(data.id));
  },
};
