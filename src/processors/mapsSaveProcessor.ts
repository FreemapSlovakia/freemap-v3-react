import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapsSave, MapData } from 'fm3/actions/mapsActions';
import { httpRequest } from 'fm3/authAxios';
import { RootState } from 'fm3/storeCreator';

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  errorKey: 'maps.saveError',
  handle: async ({ getState }) => {
    await httpRequest({
      getState,
      method: 'PATCH',
      url: `/maps/${getState().maps.id}`,
      expectedStatus: 204,
      data: { data: getMapDataFromState(getState()) },
    });
  },
};

export function getMapDataFromState(state: RootState): MapData {
  const {
    tracking,
    drawingLines,
    drawingPoints,
    routePlanner,
    objects,
    gallery,
    trackViewer,
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
  };
}
