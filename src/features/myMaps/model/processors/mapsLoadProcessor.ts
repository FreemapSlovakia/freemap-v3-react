import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { isAbortError } from '@shared/isAbortError.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { putOfflineMap } from '../../offlineStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  mapsLoad,
  mapsLoaded,
  mapsLoadFailed,
  mapsRestore,
} from '../actions.js';
import { readMapDocument } from '../loadMapDocument.js';

export const mapsLoadProcessor: Processor = {
  actionCreator: [mapsLoad, authSetUser, authLogout],
  handle: async ({ getState, dispatch, action, toastError }) => {
    const {
      auth,
      myMaps: { loadMeta },
    } = getState();

    if (!loadMeta || (auth.user && !auth.validated)) {
      return;
    }

    if (action.type === mapsLoad.type) {
      trackMatomo([
        'trackEvent',
        'MyMaps',
        'load',
        loadMeta.merge ? 'merge' : 'replace',
      ]);
    }

    try {
      const { meta, data, fromNetwork } = await readMapDocument(
        loadMeta.id,
        getState,
        [mapsLoad, mapsRestore, authSetUser, authLogout],
      );

      // A restore or a newer load has withdrawn this one while it was reading
      // (the offline path isn't covered by the fetch's cancel actions).
      if (getState().myMaps.loadMeta !== loadMeta) {
        return;
      }

      // Write a fresh network copy through to the offline cache *before* the
      // load-time stripping below mutates `data.map`, so the cached document
      // keeps its saved viewport/layers. Only network loads refresh the cache —
      // an offline load would otherwise re-store the copy it just read.
      if (fromNetwork && getState().myMaps.offlineIds.includes(meta.id)) {
        await putOfflineMap({ meta, data });
      }

      if (data.map) {
        if (loadMeta.ignoreMap) {
          delete data.map.lat;
          delete data.map.lon;
          delete data.map.zoom;
        }

        if (loadMeta.ignoreLayers) {
          delete data.map.layers;
          delete data.map.shading;
        }
      }

      dispatch(
        mapsLoaded({
          merge: loadMeta.merge,
          meta,
          data,
        }),
      );

      dispatch(setActiveModal(null));
    } catch (err) {
      // The load is over, so it stops being pending — or the map that failed
      // would keep its `id=` in the URL, navigating to it again would be taken
      // for a load already in flight, and the working copy of the map that is
      // actually open would stay blocked. An abort is something else taking
      // over deliberately — a newer load, or the auth check this processor
      // re-runs on — and what is pending is then that owner's to say.
      if (!isAbortError(err) && getState().myMaps.loadMeta === loadMeta) {
        dispatch(mapsLoadFailed());
      }

      await toastError(err, loadMyMapsMessages, 'fetchError');
    }
  },
};
