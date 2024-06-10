import { featureCollection } from '@turf/helpers';
import { exportMapFeatures, setActiveModal } from 'fm3/actions/mainActions';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { licenseNotice } from './upload';
import { httpRequest } from 'fm3/httpRequest';
import { Track } from 'fm3/types/trackingTypes';

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  const fc = featureCollection([]);

  (fc as any).metadata = {
    description: 'Exported from https://www.freemap.sk/',
    licenseNotice,
    time: new Date().toISOString(),
    content: action.payload.exportables,
  };

  const {
    drawingLines,
    routePlanner,
    tracking,
    trackViewer,
    search,
    main: { selection },
  } = getState();

  const { exportables, name, description, activity } = action.payload;

  const set = new Set(action.payload.exportables);

  if (set.has('drawingLines')) {
    // for (const line of drawingLines.lines.filter(
    //   (line) => line.type === 'line',
    // )) {
    //   fc.features.push(
    //     lineString(
    //       line.points.map((p) => [p.lon, p.lat]),
    //       { name: line.label, color: line.color },
    //     ),
    //   );
    // }
  }

  if (set.has('plannedRoute') || set.has('plannedRouteWithStops')) {
    const coordinates = routePlanner.alternatives[
      routePlanner.activeAlternativeIndex
    ]?.legs.flatMap((leg) =>
      leg.steps.flatMap((step) => step.geometry.coordinates),
    );

    if (coordinates) {
      await httpRequest({
        url: '/garmin-courses',
        method: 'POST',
        data: {
          name,
          description,
          activity,
          coordinates,
        },
        getState,
      });
    }

    // addPlannedRoute(fc, routePlanner, set.has('plannedRouteWithStops'));
  }

  if (set.has('tracking')) {
    let track: Track | undefined;

    if (selection?.type === 'tracking') {
      const { id } = selection;

      track =
        typeof id === 'number'
          ? tracking.tracks[id]
          : tracking.tracks.find((t) => t.token === id);
    } else {
      track = tracking.tracks[0];
    }

    if (track) {
      await httpRequest({
        url: '/garmin-courses',
        method: 'POST',
        data: {
          name,
          description,
          activity,
          coordinates: track.trackPoints.map((tp) => [tp.lon, tp.lat]), // TODO other tracking point properties
        },
        getState,
      });
    }

    // addTracking(fc, tracking);
  }

  if (set.has('gpx')) {
    // if (trackViewer.trackGeojson) {
    //   fc.features.push(...trackViewer.trackGeojson.features);
    // }
  }

  if (set.has('search')) {
    // const geojson = search.selectedResult?.geojson;
    // switch (geojson?.type) {
    //   case 'FeatureCollection':
    //     fc.features.push(...geojson.features);
    //     break;
    //   case 'Feature':
    //     fc.features.push(geojson);
    //     break;
    // }
  }

  dispatch(setActiveModal(null));
};

export default handle;
