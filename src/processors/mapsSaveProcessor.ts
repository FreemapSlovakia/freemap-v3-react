import {
  MapData,
  MapMeta,
  mapsLoad,
  mapsLoadList,
  mapsMergeMeta,
  mapsSave,
} from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { StringDates } from 'fm3/types/common';
import { DefaultRootState } from 'react-redux';
import { assertType } from 'typescript-is';
import { handleTrackUpload } from './trackViewerUploadTrackProcessor';

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

    if (activeMap) {
      const data = assertType<StringDates<MapMeta>>(await res.json());

      dispatch(
        mapsMergeMeta({
          ...data,
          createdAt:
            data.createdAt === undefined ? undefined : new Date(data.createdAt),
          modifiedAt:
            data.modifiedAt === undefined
              ? undefined
              : new Date(data.modifiedAt),
        }),
      );
    } else {
      dispatch(
        mapsLoad({ id: assertType<{ id: string }>(await res.json()).id }),
      ); // TODO skip loading; let server return meta
    }
  },
};

function getMapDataFromState(state: DefaultRootState): MapData {
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
    },
  };
}
