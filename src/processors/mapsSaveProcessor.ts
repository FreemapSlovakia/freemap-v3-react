import {
  MapData,
  mapsLoad,
  mapsLoadList,
  mapsSave,
} from 'fm3/actions/mapsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
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

    const { id } = getState().maps;

    const { data } = await httpRequest({
      getState,
      method: id ? 'PATCH' : 'POST',
      url: `/maps/${id ?? ''}`,
      expectedStatus: [200, 204],
      data: {
        name: action.payload?.name,
        data: getMapDataFromState(getState()),
        public: true, // TODO
      },
    });

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.saved',
      }),
    );

    dispatch(mapsLoadList());

    if (!id) {
      dispatch(mapsLoad({ id: assertType<{ id: string }>(data).id })); // TODO skip loading in this case
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
