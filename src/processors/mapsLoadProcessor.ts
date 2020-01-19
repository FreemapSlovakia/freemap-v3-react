import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsDataLoaded, mapsLoad } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';

export const mapsLoadProcessor: Processor<typeof mapsLoad> = {
  actionCreator: mapsLoad,
  errorKey: 'maps.fetchError',
  handle: async ({ getState, dispatch, action }) => {
    if (action.payload !== undefined) {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: `/maps/${action.payload}`,
        expectedStatus: 200,
      });

      dispatch(mapsDataLoaded(data.data));
    }
  },
};
