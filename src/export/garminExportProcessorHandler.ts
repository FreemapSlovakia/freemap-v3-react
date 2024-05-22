import { featureCollection, Geometry, GeometryCollection } from '@turf/helpers';
import { exportMapFeatures, setActiveModal } from 'fm3/actions/mainActions';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { licenseNotice } from './upload';

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  // getState,
  action,
  dispatch,
}) => {
  const fc = featureCollection<Geometry | GeometryCollection>([]);

  (fc as any).metadata = {
    description: 'Exported from https://www.freemap.sk/',
    licenseNotice,
    time: new Date().toISOString(),
    content: action.payload.exportables,
  };

  // const { drawingLines, routePlanner, tracking, trackViewer, search } =
  //   getState();

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
    // addPlannedRoute(fc, routePlanner, set.has('plannedRouteWithStops'));
  }

  if (set.has('tracking')) {
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
