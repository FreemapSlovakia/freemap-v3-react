import { authLogout, authSetUser } from 'fm3/actions/authActions';
import { MapMeta, mapsLoadList, mapsSetList } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { StringDates } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const mapsLoadListProcessor: Processor = {
  actionCreator: [mapsLoadList, authSetUser, authLogout],
  errorKey: 'maps.fetchListError',
  handle: async ({ getState, dispatch }) => {
    if (getState().auth.user) {
      const res = await httpRequest({
        getState,
        url: '/maps/',
        expectedStatus: 200,
      });

      dispatch(
        mapsSetList(
          assertType<StringDates<MapMeta[]>>(await res.json()).map((map) => ({
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
