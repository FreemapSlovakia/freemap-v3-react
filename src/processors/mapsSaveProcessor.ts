import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsSave } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { selectFeature } from 'fm3/actions/mainActions';

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  errorKey: 'maps.saveError',
  handle: async ({ getState, dispatch }) => {
    const { data } = await httpRequest({
      getState,
      method: 'PATCH',
      url: `/maps/${getState().maps.id}`,
      expectedStatus: 204,
      data: {
        data: {
          lines: getState().drawingLines.lines,
        },
      },
    });

    dispatch(selectFeature({ type: 'maps', id: data.id }));
  },
};
