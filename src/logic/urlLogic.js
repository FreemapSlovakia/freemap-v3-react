import { createLogic } from 'redux-logic';
import history from 'fm3/history';
import refModals from 'fm3/refModals';
import allTips from 'fm3/tips/index.json';
import * as at from 'fm3/actionTypes';

const tipKeys = allTips.map(([key]) => key);

export const urlLogic = createLogic({
  type: [
    at.MAP_LOAD_STATE, at.MAP_REFOCUS, /^ROUTE_PLANNER_/, at.SET_TOOL, at.CLEAR_MAP, at.MAP_RESET,
    at.TRACK_VIEWER_SET_TRACK_UID, at.TRACK_VIEWER_COLORIZE_TRACK_BY, at.TRACK_VIEWER_DOWNLOAD_TRACK,
    at.GALLERY_REQUEST_IMAGE, at.GALLERY_CLEAR, at.GALLERY_SHOW_FILTER, at.GALLERY_HIDE_FILTER, at.GALLERY_SHOW_UPLOAD_MODAL, at.GALLERY_HIDE_UPLOAD_MODAL,
    at.CHANGESETS_SET_DAYS, at.CHANGESETS_SET_AUTHOR_NAME,
    /^INFO_POINT_.*/, /^DISTANCE_MEASUREMENT_.*/, /^AREA_MEASUREMENT_.*/,
    at.ELEVATION_MEASUREMENT_SET_POINT,
    at.GALLERY_SET_FILTER, at.SET_ACTIVE_MODAL, /^TIPS_.*/,
    at.AUTH_CHOOSE_LOGIN_METHOD, at.AUTH_LOGIN_CLOSE, /^AUTH_LOGIN_WITH_.*/,
    /^OSM_LOAD_.*/, at.ENABLE_UPDATING_URL,
  ],
  process({ getState, action }, dispatch, done) {
    const {
      map,
      routePlanner,
      trackViewer,
      gallery,
      infoPoint,
      changesets,
      distanceMeasurement,
      areaMeasurement,
      elevationMeasurement,
      gallery: { filter: galleryFilter },
      main,
      tips,
      auth,
    } = getState();

    if (!main.urlUpdatingEnabled) {
      done();
      return;
    }

    const queryParts = [
      `map=${map.zoom}/${serializePoint({ lat: map.lat, lon: map.lon })}`,
      `layers=${map.mapType}${map.overlays.join('')}`,
    ];

    if (main.tool) {
      queryParts.push(`tool=${main.tool}`);
    }

    if (routePlanner.start || routePlanner.finish || routePlanner.midpoints.length) {
      queryParts.push(`points=${[routePlanner.start, ...routePlanner.midpoints, routePlanner.finish].map(point => serializePoint(point)).join(',')}`);

      if (routePlanner.transportType) {
        queryParts.push(`transport=${routePlanner.transportType}`);
      }
    }

    if (trackViewer.trackUID) {
      queryParts.push(`track-uid=${trackViewer.trackUID}`);
    }

    if (trackViewer.gpxUrl) {
      queryParts.push(`gpx-url=${trackViewer.gpxUrl}`);
    }

    if (trackViewer.osmNodeId) {
      queryParts.push(`osm-node=${trackViewer.osmNodeId}`);
    }

    if (trackViewer.osmWayId) {
      queryParts.push(`osm-way=${trackViewer.osmWayId}`);
    }

    if (trackViewer.osmRelationId) {
      queryParts.push(`osm-relation=${trackViewer.osmRelationId}`);
    }

    if (trackViewer.colorizeTrackBy) {
      queryParts.push(`track-colorize-by=${trackViewer.colorizeTrackBy}`);
    }

    if (gallery.activeImageId) {
      queryParts.push(`image=${gallery.activeImageId}`);
    }

    if (changesets.days) {
      queryParts.push(`changesets-days=${changesets.days}`);
    }

    if (changesets.authorName) {
      queryParts.push(`changesets-author=${encodeURIComponent(changesets.authorName)}`);
    }

    if (infoPoint.lat && infoPoint.lon) {
      queryParts.push(`info-point=${serializePoint(infoPoint)}`);
      if (infoPoint.label) {
        queryParts.push(`info-point-label=${encodeURIComponent(infoPoint.label)}`);
      }
    }

    if (distanceMeasurement.points && distanceMeasurement.points.length) {
      queryParts.push(`distance-measurement-points=${distanceMeasurement.points
        .map(point => serializePoint(point)).join(',')}`);
    }

    if (areaMeasurement.points && areaMeasurement.points.length) {
      queryParts.push(`area-measurement-points=${areaMeasurement.points
        .map(point => serializePoint(point)).join(',')}`);
    }

    if (elevationMeasurement.point) {
      queryParts.push(`elevation-measurement-point=${serializePoint(elevationMeasurement.point)}`);
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

    if (main.activeModal && refModals.includes(main.activeModal)) {
      queryParts.push(`show=${main.activeModal}`);
    }

    if (gallery.showFilter) {
      queryParts.push('show=gallery-filter');
    }

    if (gallery.showUploadModal) {
      queryParts.push('show=gallery-upload');
    }

    if (auth.chooseLoginMethod) {
      queryParts.push('show=login');
    }

    if (main.activeModal === 'tips' && tips.tip && tipKeys.includes(tips.tip)) {
      queryParts.push(`tip=${tips.tip}`);
    }

    const search = `?${queryParts.join('&')}`;

    if (window.location.search !== search) {
      history[action.type === 'MAP_REFOCUS' ? 'replace' : 'push']({ pathname: '/', search });
    }

    done();
  },
});

function serializePoint(point) {
  return point ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}` : '';
}

export default urlLogic;
