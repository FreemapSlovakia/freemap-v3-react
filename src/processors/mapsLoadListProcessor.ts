import { authLogout, authSetUser } from 'fm3/actions/authActions';
import { MapMeta, mapsLoadList, mapsSetList } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { StringDates } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const mapsLoadListProcessor: Processor = {
  actionCreator: [mapsLoadList, authSetUser, authLogout],
  errorKey: 'maps.fetchListError',
  handle: async ({ getState, dispatch }) => {
    if (getState().auth.user) {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: '/maps/',
        expectedStatus: 200,
      });

      const okData = assertType<StringDates<MapMeta[]>>(data);

      dispatch(
        mapsSetList(
          okData.map((map) => ({
            ...map,
            createdAt: new Date(map.createdAt),
            modifiedAt: new Date(map.modifiedAt),
          })),
        ),
      );
    } else {
      dispatch(mapsSetList([]));
    }
  },
};
