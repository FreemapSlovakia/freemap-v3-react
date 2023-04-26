import { authLogout, authSetUser } from 'fm3/actions/authActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { MapMeta, mapsLoadList, mapsSetList } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { StringDates } from 'fm3/types/common';
import { assert } from 'typia';

export const mapsLoadListProcessor: Processor = {
  actionCreator: [mapsLoadList, authSetUser, authLogout, setActiveModal],
  errorKey: 'maps.fetchListError',
  handle: async ({ getState, dispatch }) => {
    if (getState().auth.validated && getState().main.activeModal === 'maps') {
      const res = await httpRequest({
        getState,
        url: '/maps/',
        expectedStatus: 200,
        cancelActions: [mapsLoadList, authSetUser, authLogout, setActiveModal],
      });

      dispatch(
        mapsSetList(
          assert<StringDates<MapMeta[]>>(await res.json()).map((map) => ({
            ...map,
            createdAt: new Date(map.createdAt),
            modifiedAt: new Date(map.modifiedAt),
          })),
        ),
      );
    } else if (getState().maps.maps.length) {
      dispatch(mapsSetList([]));
    }
  },
};
