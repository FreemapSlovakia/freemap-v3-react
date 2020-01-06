import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { selectFeature } from 'fm3/actions/mainActions';

export const mapsLoadProcessor: Processor<typeof selectFeature> = {
  actionCreator: selectFeature,
  errorKey: 'maps.fetchError',
  handle: async ({ getState, dispatch, action }) => {
    if (action.payload?.type === 'maps' && action.payload?.id !== undefined) {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: `/maps/${action.payload?.id}`,
        expectedStatus: 200,
      });

      dispatch(mapsDataLoaded(data.data));
    }
  },
};
