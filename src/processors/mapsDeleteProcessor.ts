import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { deleteFeature } from 'fm3/actions/mainActions';

export const mapsDeleteProcessor: Processor<typeof deleteFeature> = {
  actionCreator: deleteFeature,
  errorKey: 'maps.deleteError',
  handle: async ({ getState, action }) => {
    if (action.payload.type === 'maps') {
      await httpRequest({
        getState,
        method: 'DELETE',
        url: `/maps/${action.payload.id}`,
        expectedStatus: 204,
      });
    }
  },
};
