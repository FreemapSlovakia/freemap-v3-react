import { assert } from 'typia';
import {
  type MapData,
  type MapMeta,
  mapsLoadList,
  mapsSave,
  mapsSetMeta,
} from '../actions/mapsActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { RootState } from '../store.js';
import type { StringDates } from '../types/common.js';
import { handleTrackUpload } from './trackViewerUploadTrackProcessor.js';

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  errorKey: 'maps.saveError',
  async handle({ getState, dispatch, action }) {
    if (getState().trackViewer.trackGpx && !getState().trackViewer.trackUID) {
      await handleTrackUpload({
        dispatch,
        getState,
      });

      dispatch(action);

      return;
    }

    const { activeMap } = getState().maps;

    const res = await httpRequest({
      getState,
      method: activeMap ? 'PATCH' : 'POST',
      url: `/maps/${activeMap?.id ?? ''}`,
      expectedStatus: [200, 412],
      headers: activeMap
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
          id: 'maps.conflictError',
          style: 'danger',
          messageKey: 'maps.conflictError',
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

    const data = assert<StringDates<MapMeta>>(await res.json());

    dispatch(
      mapsSetMeta({
        ...data,
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
      }),
    );
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
      start: routePlanner.start,
      midpoints: routePlanner.midpoints,
      finish: routePlanner.finish,
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
      mapType: map.mapType,
      lat: map.lat,
      lon: map.lon,
      zoom: map.zoom,
      overlays: map.overlays,
      customLayers: map.customLayers,
    },
  };
}
