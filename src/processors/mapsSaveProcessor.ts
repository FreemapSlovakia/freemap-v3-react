import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsSave } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  errorKey: 'maps.saveError',
  handle: async ({ getState }) => {
    await httpRequest({
      getState,
      method: 'PATCH',
      url: `/maps/${getState().maps.id}`,
      expectedStatus: 204,
      data: {
        data: {
          lines: getState().drawingLines.lines,
          points: getState().drawingPoints.points,
        },
      },
    });
  },
};
