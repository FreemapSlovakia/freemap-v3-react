import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  type MapData,
  MapMetaSchema,
  mapsLoadList,
  mapsSave,
  mapsSetDirty,
  mapsSetMeta,
} from '../actions.js';
import {
  captureMapsDirtyBaseline,
  discardTrackDraft,
  isDirtySinceBaseline,
  rekeyMapsDirtyBaseline,
  setMapsSaveInFlight,
} from './mapsDirtyProcessor.js';

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  async handle({ getState, dispatch, action, toastError }) {
    try {
      const { activeMap } = getState().myMaps;

      const asNew = action.payload?.asCopy;

      const patchExisting = activeMap && !asNew;

      trackMatomo([
        'trackEvent',
        'MyMaps',
        asNew ? 'copy' : patchExisting ? 'update' : 'create',
      ]);

      // The content about to be sent becomes the new clean reference point, so
      // edits made while the request is in flight still register as dirty.
      captureMapsDirtyBaseline(getState());

      // A map being created has no id yet; keep its baseline alive until the
      // response assigns one, so edits made meanwhile still register.
      setMapsSaveInFlight(true);

      const res = await httpRequest({
        getState,
        method: patchExisting ? 'PATCH' : 'POST',
        url: `/maps/${patchExisting ? activeMap.id : ''}`,
        expectedStatus: [200, 412],
        headers: patchExisting
          ? {
              'If-Unmodified-Since': activeMap.modifiedAt.toUTCString(),
            }
          : {},
        data: {
          name: action.payload?.name,
          public: true, // TODO
          writers: action.payload?.writers,
          data: getMapDataFromState(getState()),
        },
      });

      if (res.status === 412) {
        dispatch(
          toastsAdd({
            id: 'myMaps.conflictError',
            style: 'danger',
            messageKey: 'conflictError',
            messageLoader: loadMyMapsMessages,
          }),
        );

        return;
      }

      dispatch(
        toastsAdd({
          style: 'success',
          timeout: 5000,
          messageKey: 'general.saved',
        }),
      );

      dispatch(mapsLoadList());

      const meta = MapMetaSchema.parse(await res.json());

      // Before the meta lands: the dispatch below makes the map active, which
      // would otherwise recapture the baseline from the current state and bless
      // any in-flight edits as saved.
      rekeyMapsDirtyBaseline(meta.id);

      dispatch(mapsSetMeta(meta));

      // Clean only if nothing changed while the request was in flight.
      const stillDirty = isDirtySinceBaseline(getState());

      dispatch(mapsSetDirty(stillDirty));

      if (!stillDirty) {
        // Stored copy and screen agree — the stash has nothing left to rescue.
        discardTrackDraft();
      }
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'saveError');
    } finally {
      setMapsSaveInFlight(false);
    }
  },
};

function getMapDataFromState(state: RootState): MapData {
  const {
    tracking,
    drawingLines,
    drawingPoints,
    routePlanner,
    objects,
    gallery,
    trackViewer,
    map,
  } = state;

  return {
    lines: drawingLines.lines,
    points: drawingPoints.points,
    tracking: {
      trackedDevices: tracking.trackedDevices,
    },
    routePlanner: {
      transportType: routePlanner.transportType,
      points: routePlanner.points,
      finishOnly: routePlanner.finishOnly,
      pickMode: routePlanner.pickMode,
      mode: routePlanner.mode,
      milestones: routePlanner.milestones,
    },
    objectsV2: {
      active: objects.active,
    },
    galleryFilter: gallery.filter,
    // Only the fields the loader reads back; the rest of the slice is transient
    // view state (selected track, elevation decision, render cache).
    trackViewer: {
      trackGeojson: trackViewer.trackGeojson,
      trackUID: trackViewer.trackUID,
      gpxUrl: trackViewer.gpxUrl,
    },
    map: {
      lat: map.lat,
      lon: map.lon,
      zoom: map.zoom,
      layers: map.layers,
      customLayers: map.customLayers,
      shading: map.shading,
    },
  };
}
