import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  type MapData,
  MapMetaSchema,
  mapsLoadList,
  mapsSave,
  mapsSetMeta,
} from '../actions.js';

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  async handle({ getState, dispatch, action, toastError }) {
    try {
      const { activeMap } = getState().myMaps;

      const asNew = action.payload?.asCopy;

      const patchExisting = activeMap && !asNew;

      window._paq.push([
        'trackEvent',
        'MyMaps',
        asNew ? 'copy' : patchExisting ? 'update' : 'create',
      ]);

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

      dispatch(mapsSetMeta(MapMetaSchema.parse(await res.json())));
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'saveError');
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
      showLine: tracking.showLine,
      showPoints: tracking.showPoints,
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
    trackViewer,
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
