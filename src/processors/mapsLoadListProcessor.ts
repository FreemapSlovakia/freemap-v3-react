import { authLogout, authSetUser } from 'fm3/actions/authActions';
import { setTool } from 'fm3/actions/mainActions';
import { MapMeta, mapsLoadList, mapsSetList } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

export const mapsLoadListProcessor: Processor = {
  actionCreator: [setTool, mapsLoadList, authSetUser, authLogout],
  errorKey: 'maps.fetchListError',
  handle: async ({ getState, dispatch }) => {
    if (getState().main.tool === 'maps') {
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
    } else if (getState().maps.maps) {
      dispatch(mapsSetList(undefined));
    }
  },
};
