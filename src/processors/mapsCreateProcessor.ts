import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsCreate } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { selectFeature } from 'fm3/actions/mainActions';

export const mapsCreateProcessor: Processor<typeof mapsCreate> = {
  actionCreator: mapsCreate,
  errorKey: 'maps.createError',
  handle: async ({ getState, dispatch }) => {
    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: '/maps/',
      expectedStatus: 200,
      data: {
        name: window.prompt('Name?'),
        public: true, // TODO
        data: {
          lines: getState().drawingLines.lines,
        },
      },
    });

    dispatch(selectFeature({ type: 'maps', id: data.id }));
  },
};
