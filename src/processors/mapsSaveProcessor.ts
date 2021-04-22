import { MapData, mapsSave } from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { DefaultRootState } from 'react-redux';

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  errorKey: 'maps.saveError',
  handle: async ({ getState, dispatch }) => {
    await httpRequest({
      getState,
      method: 'PATCH',
      url: `/maps/${getState().maps.id}`,
      expectedStatus: 204,
      data: { data: getMapDataFromState(getState()) },
    });

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.saved',
      }),
    );
  },
};

export function getMapDataFromState(state: DefaultRootState): MapData {
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
    objects: objects.objects,
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
