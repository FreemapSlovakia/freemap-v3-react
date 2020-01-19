import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsLoadList, mapsSetList } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { selectFeature } from 'fm3/actions/mainActions';
import { isActionOf } from 'typesafe-actions';

export const mapsLoadListProcessor: Processor<
  typeof selectFeature | typeof mapsLoadList
> = {
  actionCreator: [selectFeature, mapsLoadList],
  errorKey: 'maps.fetchListError',
  handle: async ({ getState, dispatch, action }) => {
    if (isActionOf(mapsLoadList, action) || action.payload?.type === 'maps') {
      if (getState().auth.user) {
        const { data } = await httpRequest({
          getState,
          method: 'GET',
          url: '/maps/',
          expectedStatus: 200,
        });

        dispatch(mapsSetList(data));
      } else {
        dispatch(mapsSetList([]));
      }
    }
  },
};
