import { isNetworkError } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { getOfflineMap, putOfflineMap } from '../../offlineStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  type MapData,
  type MapMeta,
  mapsLoad,
  mapsLoaded,
} from '../actions.js';
import { loadMapDocument } from '../loadMapDocument.js';

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
      window._paq.push([
        'trackEvent',
        'MyMaps',
        'load',
        loadMeta.merge ? 'merge' : 'replace',
      ]);
    }

    try {
      let meta: MapMeta;
      let data: MapData;
      let fromNetwork = false;

      try {
        if (!navigator.onLine) {
          throw new Error('offline');
        }

        ({ meta, data } = await loadMapDocument(loadMeta.id, getState, [
          mapsLoad,
          authSetUser,
          authLogout,
        ]));

        fromNetwork = true;
      } catch (err) {
        // Offline, or a genuine network failure while we believed we were
        // online: resolve from the offline copy if the map was flagged for
        // offline use. A server or parse error surfaces instead of silently
        // serving a stale copy.
        const offline =
          !navigator.onLine || isNetworkError(err)
            ? await getOfflineMap(loadMeta.id)
            : undefined;

        if (!offline) {
          throw err;
        }

        ({ meta, data } = offline);
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
      await toastError(err, loadMyMapsMessages, 'fetchError');
    }
  },
};
