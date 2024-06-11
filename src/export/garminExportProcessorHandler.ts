import { exportMapFeatures, setActiveModal } from 'fm3/actions/mainActions';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/httpRequest';
import { LineString } from 'geojson';
import { toastsAdd } from 'fm3/actions/toastsActions';
import length from '@turf/length';
import { lineString } from '@turf/helpers';

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  const {
    drawingLines,
    routePlanner,
    tracking,
    trackViewer,
    search,
    main: { selection },
  } = getState();

  const {
    exportables: [exportable],
    name,
    description,
    activity,
  } = action.payload;

  let coordinates;

  if (exportable === 'drawingLines') {
    let line;

    if (selection?.type === 'draw-line-poly') {
      const { id } = selection;

      line = drawingLines.lines[id];

      if (line.type !== 'line') {
        line = undefined;
      }
    } else {
      const lines = drawingLines.lines.filter((line) => line.type === 'line');

      if (lines.length === 1) {
        line = lines[0];
      }
    }

    coordinates = line?.points.map((p) => [p.lon, p.lat]);
  } else if (
    exportable === 'plannedRoute' ||
    exportable === 'plannedRouteWithStops'
  ) {
    coordinates = routePlanner.alternatives[
      routePlanner.activeAlternativeIndex
    ]?.legs.flatMap((leg) =>
      leg.steps.flatMap((step) => step.geometry.coordinates),
    );
  } else if (exportable === 'tracking') {
    let track;

    if (selection?.type === 'tracking') {
      const { id } = selection;

      track =
        typeof id === 'number'
          ? tracking.tracks[id]
          : tracking.tracks.find((t) => t.token === id);
    } else if (tracking.tracks.length === 1) {
      track = tracking.tracks[0];
    }

    coordinates = track?.trackPoints.map((tp) => [tp.lon, tp.lat]); // TODO other tracking point properties
  } else if (exportable === 'gpx') {
    if (trackViewer.trackGeojson) {
      const lines = trackViewer.trackGeojson.features
        .map((f) => f.geometry)
        .filter((g): g is LineString => g.type === 'LineString');

      if (lines.length === 1) {
        coordinates = lines[0].coordinates;
      }
    }
  } else if (exportable === 'search') {
    const geojson = search.selectedResult?.geojson;

    switch (geojson?.type) {
      case 'FeatureCollection':
        const lines = geojson.features
          .map((f) => f.geometry)
          .filter((g): g is LineString => g.type === 'LineString');

        if (lines.length === 1) {
          coordinates = lines[0].coordinates;
        }

        break;

      case 'Feature':
        const { geometry } = geojson;

        if (geometry.type === 'LineString') {
          coordinates = geometry.coordinates;
        }

        break;
    }
  }

  if (coordinates && coordinates.length > 1) {
    await httpRequest({
      url: '/garmin-courses',
      method: 'POST',
      data: {
        name,
        description,
        activity,
        coordinates,
        distance: length(lineString(coordinates), { units: 'kilometers' }),
        elevationGain: 0,
        elevationLoss: 0,
      },
      getState,
    });

    dispatch(
      toastsAdd({
        id: 'gpxExport',
        messageKey: 'general.success',
      }),
    );
  } // TODO else report error "nothing to export" or better - disable exporting if there is nothing

  dispatch(setActiveModal(null));
};

export default handle;
