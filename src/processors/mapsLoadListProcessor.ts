import { setTool } from 'fm3/actions/mainActions';
import { MapMeta, mapsLoadList, mapsSetList } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';
import { assertType } from 'typescript-is';

export const mapsLoadListProcessor: Processor<
  typeof setTool | typeof mapsLoadList
> = {
  actionCreator: [setTool, mapsLoadList],
  errorKey: 'maps.fetchListError',
  handle: async ({ getState, dispatch, action }) => {
    if (isActionOf(mapsLoadList, action) || action.payload === 'maps') {
      if (getState().auth.user) {
        const { data } = await httpRequest({
          getState,
          method: 'GET',
          url: '/maps/',
          expectedStatus: 200,
        });

        dispatch(mapsSetList(assertType<MapMeta[]>(data)));
      } else {
        dispatch(mapsSetList([]));
      }
    }
  },
};
