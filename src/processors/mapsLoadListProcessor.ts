import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsSetList } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { selectFeature } from 'fm3/actions/mainActions';

export const mapsLoadListProcessor: Processor<typeof selectFeature> = {
  actionCreator: selectFeature,
  errorKey: 'maps.fetchError',
  handle: async ({ getState, dispatch, action }) => {
    if (action.payload?.type === 'maps') {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: '/maps/',
        expectedStatus: 200,
      });

      dispatch(mapsSetList(data));
    }
  },
};
