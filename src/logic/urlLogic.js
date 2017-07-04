import { createLogic } from 'redux-logic';
import history from 'fm3/history';

export const urlLogic = createLogic({
  type: ['MAP_REFOCUS', /^ROUTE_PLANNER_/, 'SET_TOOL', 'SET_EMBEDDED_MODE',
    'MAP_RESET', 'TRACK_VIEWER_SET_TRACK_UID',
    'GALLERY_SET_ACTIVE_IMAGE_ID', 'GALLERY_SET_IMAGES',
    'CHANGESETS_SET_DAYS', 'CHANGESETS_SET_AUTHOR_NAME',
    /^INFO_POINT_.*/, /^DISTANCE_MEASUREMENT_.*/, /^AREA_MEASUREMENT_.*/,
    'ELEVATION_MEASUREMENT_SET_POINT'],
  process({ getState, action }, dispatch, done) {
    const {
      map: { mapType, overlays, zoom, lat, lon },
      main: { embeddedMode, tool },
      routePlanner: { start, finish, midpoints, transportType },
      trackViewer: { trackUID },
      gallery: { activeImageId },
      infoPoint,
      changesets: { days, authorName },
      distanceMeasurement: { points: distanceMeasurementPoints },
      areaMeasurement: { points: areaMeasurementPoints },
      elevationMeasurement: { point: elevationMeasurementPoint },
    } = getState();

    const queryParts = [
      `map=${zoom}/${serializePoint({ lat, lon })}`,
      `layers=${mapType}${overlays.join('')}`,
    ];

    if (start && finish) {
      queryParts.push(
        `transport=${transportType}`,
        `points=${[start, ...midpoints, finish].map(point => serializePoint(point)).join(',')}`,
      );
    }

    if (trackUID) {
      queryParts.push(`track-uid=${trackUID}`);
    }

    if (activeImageId) {
      queryParts.push(`image=${activeImageId}`);
    }

    if (embeddedMode) {
      queryParts.push('embed=true');
    }

    if (tool === 'changesets' && days) {
      queryParts.push(`changesets-days=${days}`);
      if (authorName) {
        queryParts.push(`changesets-author=${encodeURIComponent(authorName)}`);
      }
    }

    if (infoPoint.lat && infoPoint.lon) {
      queryParts.push(
        `info-point=${serializePoint(infoPoint)}`,
      );
      if (infoPoint.label) {
        queryParts.push(`info-point-label=${encodeURIComponent(infoPoint.label)}`);
      }
    }

    if (distanceMeasurementPoints && distanceMeasurementPoints.length) {
      queryParts.push(
        `distance-measurement-points=${distanceMeasurementPoints
          .map(point => serializePoint(point)).join(',')}`,
      );
    }

    if (areaMeasurementPoints && areaMeasurementPoints.length) {
      queryParts.push(
        `area-measurement-points=${areaMeasurementPoints
          .map(point => serializePoint(point)).join(',')}`,
      );
    }

    if (elevationMeasurementPoint) {
      queryParts.push(
        `elevation-measurement-point=${serializePoint(elevationMeasurementPoint)}`,
      );
    }

    const search = `?${queryParts.join('&')}`;

    if (location.search !== search) {
      history[action.type === 'MAP_REFOCUS' ? 'replace' : 'push']({ search });
    }

    done();
  },
});

function serializePoint(point) {
  return point ? `${point.lat.toFixed(5)}/${point.lon.toFixed(5)}` : '';
}

export default urlLogic;
