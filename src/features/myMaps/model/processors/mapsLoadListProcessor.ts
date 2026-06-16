import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import z from 'zod';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import { MapMetaSchema, mapsLoadList, mapsSetList } from '../actions.js';

export const mapsLoadListProcessor: Processor = {
  actionCreator: [mapsLoadList, authSetUser, authLogout, setActiveModal],
  handle: async ({ getState, dispatch, toastError }) => {
    try {
      if (
        getState().auth.validated &&
        getState().main.activeModal === 'my-maps'
      ) {
        const res = await httpRequest({
          getState,
          url: '/maps/',
          expectedStatus: 200,
          cancelActions: [
            mapsLoadList,
            authSetUser,
            authLogout,
            setActiveModal,
          ],
        });

        dispatch(mapsSetList(z.array(MapMetaSchema).parse(await res.json())));
      } else if (getState().myMaps.maps.length) {
        dispatch(mapsSetList([]));
      }
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'fetchListError');
    }
  },
};
