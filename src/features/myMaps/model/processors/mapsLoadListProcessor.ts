import { httpRequest, isNetworkError } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import z from 'zod';
import {
  getOfflineMapListSnapshot,
  saveOfflineMapListSnapshot,
} from '../../offlineStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  type MapMeta,
  MapMetaSchema,
  mapsLoadList,
  mapsSetList,
} from '../actions.js';
import { refreshStaleOfflineMaps } from './mapsOfflineProcessor.js';

export const mapsLoadListProcessor: Processor = {
  actionCreator: [mapsLoadList, authSetUser, authLogout, setActiveModal],
  handle: async ({ getState, dispatch, toastError }) => {
    // The events create/edit form reuses this list for its source-map picker,
    // so load it whenever either modal is open.
    const modalType = getState().main.activeModal?.type;

    if (modalType !== 'my-maps' && modalType !== 'events') {
      if (getState().myMaps.maps.length) {
        dispatch(mapsSetList([]));
      }

      return;
    }

    // Offline: render the last-seen list from the snapshot so flagged maps stay
    // reachable. (Auth can't be re-validated offline, so don't gate on it.)
    if (!navigator.onLine) {
      dispatch(mapsSetList((await getOfflineMapListSnapshot()) ?? []));

      return;
    }

    if (!getState().auth.validated) {
      return;
    }

    let list: MapMeta[];

    try {
      const res = await httpRequest({
        getState,
        url: '/maps/',
        expectedStatus: 200,
        cancelActions: [mapsLoadList, authSetUser, authLogout, setActiveModal],
      });

      list = z.array(MapMetaSchema).parse(await res.json());
    } catch (err) {
      // Only a genuine network failure (we believed we were online) falls back
      // to the cached list; a server or parse error should surface rather than
      // silently showing a stale snapshot.
      const snapshot = isNetworkError(err)
        ? await getOfflineMapListSnapshot()
        : undefined;

      if (snapshot?.length) {
        dispatch(mapsSetList(snapshot));
      } else {
        await toastError(err, loadMyMapsMessages, 'fetchListError');
      }

      return;
    }

    dispatch(mapsSetList(list));

    // Best-effort offline upkeep: persisting the snapshot or refreshing stale
    // copies must never clobber the freshly loaded list, so keep it out of the
    // fetch try/catch above.
    try {
      await saveOfflineMapListSnapshot(list);

      await refreshStaleOfflineMaps(list, getState, dispatch);
    } catch (err) {
      console.warn('Offline My Maps upkeep failed:', err);
    }
  },
};
