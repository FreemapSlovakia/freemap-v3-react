import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import type { StringDates } from '@shared/types/common.js';
import { assert } from 'typia';
import { type MapMeta, mapsLoadList, mapsSetList } from '../actions.js';

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
