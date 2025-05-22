import { assert } from 'typia';
import { authLogout, authSetUser } from '../actions/authActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import {
  type MapMeta,
  mapsLoadList,
  mapsSetList,
} from '../actions/mapsActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { StringDates } from '../types/common.js';

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
