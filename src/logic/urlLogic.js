import { createLogic } from 'redux-logic';
import history from 'fm3/history';
import refModals from 'fm3/refModals';
import tips from 'fm3/tips/index.json';

const tipKeys = tips.map(([key]) => key);

export const urlLogic = createLogic({
  type: [
    'MAP_REFOCUS', /^ROUTE_PLANNER_/, 'SET_TOOL', 'CLEAR_MAP',
    'MAP_RESET', 'TRACK_VIEWER_SET_TRACK_UID',
    'GALLERY_REQUEST_IMAGE', 'GALLERY_CLEAR',
    'CHANGESETS_SET_DAYS', 'CHANGESETS_SET_AUTHOR_NAME',
    /^INFO_POINT_.*/, /^DISTANCE_MEASUREMENT_.*/, /^AREA_MEASUREMENT_.*/,
    'ELEVATION_MEASUREMENT_SET_POINT',
    'GALLERY_SET_FILTER', 'SET_ACTIVE_MODAL', /^TIPS_.*/,
  ],
  process({ getState, action }, dispatch, done) {
    const {
      map: {
        mapType, overlays, zoom, lat, lon,
      },
      routePlanner: {
        start, finish, midpoints, transportType,
      },
      trackViewer: { trackUID, gpxUrl, osmNodeId, osmWayId, osmRelationId },
      gallery: { activeImageId },
      infoPoint,
      changesets: { days, authorName },
      distanceMeasurement: { points: distanceMeasurementPoints },
      areaMeasurement: { points: areaMeasurementPoints },
      elevationMeasurement: { point: elevationMeasurementPoint },
      gallery: { filter: galleryFilter },
      main: { activeModal },
      tips: { tip },
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

    if (gpxUrl) {
      queryParts.push(`gpx-url=${gpxUrl}`);
    }

    if (osmNodeId) {
      queryParts.push(`osm-node=${osmNodeId}`);
    }

    if (osmWayId) {
      queryParts.push(`osm-way=${osmWayId}`);
    }

    if (osmRelationId) {
      queryParts.push(`osm-relation=${osmRelationId}`);
    }

    if (activeImageId) {
      queryParts.push(`image=${activeImageId}`);
    }

    if (days) {
      queryParts.push(`changesets-days=${days}`);
      if (authorName) {
        queryParts.push(`changesets-author=${encodeURIComponent(authorName)}`);
      }
    }

    if (infoPoint.lat && infoPoint.lon) {
      queryParts.push(`info-point=${serializePoint(infoPoint)}`);
      if (infoPoint.label) {
        queryParts.push(`info-point-label=${encodeURIComponent(infoPoint.label)}`);
      }
    }

    if (distanceMeasurementPoints && distanceMeasurementPoints.length) {
      queryParts.push(`distance-measurement-points=${distanceMeasurementPoints
        .map(point => serializePoint(point)).join(',')}`);
    }

    if (areaMeasurementPoints && areaMeasurementPoints.length) {
      queryParts.push(`area-measurement-points=${areaMeasurementPoints
        .map(point => serializePoint(point)).join(',')}`);
    }

    if (elevationMeasurementPoint) {
      queryParts.push(`elevation-measurement-point=${serializePoint(elevationMeasurementPoint)}`);
    }

    if (galleryFilter.userId) {
      queryParts.push(`gallery-user-id=${galleryFilter.userId}`);
    }

    if (galleryFilter.tag) {
      queryParts.push(`gallery-tag=${encodeURIComponent(galleryFilter.tag)}`);
    }

    if (galleryFilter.ratingFrom) {
      queryParts.push(`gallery-rating-from=${galleryFilter.ratingFrom}`);
    }

    if (galleryFilter.ratingTo) {
      queryParts.push(`gallery-rating-to=${galleryFilter.ratingTo}`);
    }

    if (galleryFilter.takenAtFrom) {
      queryParts.push(`gallery-taken-at-from=${galleryFilter.takenAtFrom.toISOString().replace(/T.*/, '')}`);
    }

    if (galleryFilter.takenAtTo) {
      queryParts.push(`gallery-taken-at-to=${galleryFilter.takenAtTo.toISOString().replace(/T.*/, '')}`);
    }

    if (galleryFilter.createdAtFrom) {
      queryParts.push(`gallery-created-at-from=${galleryFilter.createdAtFrom.toISOString().replace(/T.*/, '')}`);
    }

    if (galleryFilter.createdAtTo) {
      queryParts.push(`gallery-created-at-to=${galleryFilter.createdAtTo.toISOString().replace(/T.*/, '')}`);
    }

    if (activeModal && refModals.includes(activeModal)) {
      queryParts.push(`show=${activeModal}`);
    }

    if (activeModal === 'tips' && tip && tipKeys.includes(tip)) {
      queryParts.push(`tip=${tip}`);
    }

    const search = `?${queryParts.join('&')}`;

    if (window.location.search !== search) {
      history[action.type === 'MAP_REFOCUS' ? 'replace' : 'push']({ search });
    }

    done();
  },
});

function serializePoint(point) {
  return point ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}` : '';
}

export default urlLogic;
