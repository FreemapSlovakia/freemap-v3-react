import queryString from 'query-string';

import { getMapStateFromUrl, getMapStateDiffFromUrl } from 'fm3/urlMapUtils';
import { getTrasformedParamsIfIsOldEmbeddedFreemapUrl, getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2 } from 'fm3/oldFreemapUtils';

import { mapRefocus } from 'fm3/actions/mapActions';
import { routePlannerSetParams } from 'fm3/actions/routePlannerActions';
import { trackViewerDownloadTrack } from 'fm3/actions/trackViewerActions';
import { infoPointSet, infoPointChangeLabel } from 'fm3/actions/infoPointActions';
import { galleryRequestImage, gallerySetFilter } from 'fm3/actions/galleryActions';
import { changesetsSetDays, changesetsSetAuthorName } from 'fm3/actions/changesetsActions';
import { distanceMeasurementSetPoints } from 'fm3/actions/distanceMeasurementActions';
import { areaMeasurementSetPoints } from 'fm3/actions/areaMeasurementActions';
import { elevationMeasurementSetPoint } from 'fm3/actions/elevationMeasurementActions';

export default function handleLocationChange(store, location) {
  const query = queryString.parse(location.search);

  if (/car|foot|bike/.test(query.transport)
      && /^-?\d+(\.\d+)?\/-?\d+(\.\d+)?(,-?\d+(\.\d+)?\/-?\d+(\.\d+)?)+$/.test(query.points)) {
    const points = query.points.split(',').map(point => point.split('/').map(coord => parseFloat(coord)));

    const {
      start, finish, midpoints, transportType,
    } = store.getState().routePlanner;

    if (points.length > 1 && points.every(point => point.length === 2)) {
      const latLons = points.map(([lat, lon]) => ({ lat, lon }));
      const nextStart = latLons[0];
      const nextMidpoints = latLons.slice(1, latLons.length - 1);
      const nextFinish = latLons[latLons.length - 1];
      if (query.transport !== transportType
          || !latLonEquals(start, nextStart)
          || !latLonEquals(finish, nextFinish)
          || midpoints.length !== nextMidpoints.length
          || midpoints.some((midpoint, i) => !latLonEquals(midpoint, nextMidpoints[i]))) {
        store.dispatch(routePlannerSetParams(nextStart, nextFinish, nextMidpoints, query.transport));
      }
    }
  }

  const trackUID = query['track-uid'];
  if (trackUID && store.getState().trackViewer.trackUID !== trackUID) {
    store.dispatch(trackViewerDownloadTrack(trackUID));
  }

  const ipMatch = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(query['info-point'] || '');
  if (ipMatch) {
    const { infoPoint } = store.getState();
    const point = { lat: parseFloat(ipMatch[1]), lon: parseFloat(ipMatch[2]) };
    const label = query['info-point-label'];
    if (serializePoint(point) !== serializePoint(infoPoint) || infoPoint.label !== label) {
      store.dispatch(infoPointSet(point.lat, point.lon, label));
    }
  }

  if (query['changesets-days']) {
    const urlDays = parseInt(query['changesets-days'], 10);
    const reduxDays = store.getState().changesets.days;
    const reduxAuthor = store.getState().changesets.authorName;
    const urlAuthor = query['changesets-author'];
    if (reduxDays !== urlDays) {
      store.dispatch(changesetsSetDays(urlDays));
    }

    if (urlAuthor && reduxAuthor !== urlAuthor || reduxDays !== urlDays) {
      // we need timeout otherwise map bounds can't be read
      setTimeout(() => {
        store.dispatch(changesetsSetAuthorName(urlAuthor));
      }, 1000);
    }
  }

  ['distance', 'area'].forEach((type) => {
    const pq = query[`${type}-measurement-points`];
    if (pq) {
      const points = pq.split(',')
        .map(point => point.split('/').map(coord => parseFloat(coord))) // TODO handle NaN
        .map((pair, id) => ({ lat: pair[0], lon: pair[1], id }));
      if (serializePoints(points) !== serializePoints(store.getState()[`${type}Measurement`].points)) {
        store.dispatch((type === 'distance' ? distanceMeasurementSetPoints : areaMeasurementSetPoints)(points));
      }
    }
  });

  const emMatch = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(query['elevation-measurement-point'] || '');
  if (emMatch) {
    const point = { lat: parseFloat(emMatch[1]), lon: parseFloat(emMatch[2]) };
    if (serializePoint(point) !== serializePoint(store.getState().elevationMeasurement.point)) {
      store.dispatch(elevationMeasurementSetPoint(point));
    }
  }

  if (getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location)) {
    const { lat, lon } = getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location);
    store.dispatch(infoPointSet(lat, lon));
  }

  if (getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2(location)) {
    const { lat, lon, label } = getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2(location);
    store.dispatch(infoPointSet(lat, lon));
    if (label) {
      store.dispatch(infoPointChangeLabel(label));
    }
  }

  const gpxUrl = query['gpx-url'];
  if (gpxUrl && gpxUrl !== store.getState().trackViewer.gpxUrl) {
    store.dispatch({ type: 'GPX_LOAD', payload: gpxUrl }); // TODO to actions
  }

  const osmNodeId = parseInt(query['osm-node'], 10);
  if (osmNodeId && osmNodeId !== store.getState().trackViewer.osmNodeId) {
    store.dispatch({ type: 'OSM_LOAD_NODE', payload: osmNodeId }); // TODO to actions
  }

  const osmWayId = parseInt(query['osm-way'], 10);
  if (osmWayId && osmWayId !== store.getState().trackViewer.osmWayId) {
    store.dispatch({ type: 'OSM_LOAD_WAY', payload: osmWayId }); // TODO to actions
  }

  const osmRelationId = parseInt(query['osm-relation'], 10);
  if (osmRelationId && osmRelationId !== store.getState().trackViewer.osmRelationId) {
    store.dispatch({ type: 'OSM_LOAD_RELATION', payload: osmRelationId }); // TODO to actions
  }

  handleGallery(store, query);

  const diff = getMapStateDiffFromUrl(getMapStateFromUrl(location), store.getState().map);

  if (diff && Object.keys(diff).length) {
    store.dispatch(mapRefocus(diff));
  }
}

function handleGallery(store, query) {
  const qUserId = parseInt(query['gallery-user-id'], 10);
  const qGalleryTag = query['gallery-tag'];
  const qRatingFrom = parseFloat(query['gallery-rating-from']);
  const qRatingTo = parseFloat(query['gallery-rating-to']);
  const qTakenAtFrom = new Date(query['gallery-taken-at-from']);
  const qTakenAtTo = new Date(query['gallery-taken-at-to']);
  const qCreatedAtFrom = new Date(query['gallery-created-at-from']);
  const qCreatedAtTo = new Date(query['gallery-created-at-to']);

  if (qUserId || qGalleryTag || qRatingFrom || qRatingTo || !Number.isNaN(qTakenAtFrom.getTime()) || !Number.isNaN(qTakenAtTo.getTime())) {
    const { filter } = store.getState().gallery;
    const newFilter = {};
    if (qUserId && filter.userId !== qUserId) {
      newFilter.userId = qUserId;
    }
    if (qGalleryTag && filter.tag !== qGalleryTag) {
      newFilter.tag = qGalleryTag;
    }
    if (qRatingFrom && filter.ratingFrom !== qRatingFrom) {
      newFilter.ratingFrom = qRatingFrom;
    }
    if (qRatingTo && filter.ratingTo !== qRatingTo) {
      newFilter.ratingTo = qRatingTo;
    }
    if (!Number.isNaN(qTakenAtFrom.getTime()) && (filter.takenAtFrom ? filter.takenAtFrom.getTime() : NaN) !== qTakenAtFrom.getTime()) {
      newFilter.takenAtFrom = qTakenAtFrom;
    }
    if (!Number.isNaN(qTakenAtTo.getTime()) && (filter.takenAtTo ? filter.takenAtTo.getTime() : NaN) !== qTakenAtTo.getTime()) {
      newFilter.takenAtTo = qTakenAtTo;
    }
    if (!Number.isNaN(qCreatedAtFrom.getTime()) && (filter.createdAtFrom ? filter.createdAtFrom.getTime() : NaN) !== qCreatedAtFrom.getTime()) {
      newFilter.createdAtFrom = qCreatedAtFrom;
    }
    if (!Number.isNaN(qCreatedAtTo.getTime()) && (filter.createdAtTo ? filter.createdAtTo.getTime() : NaN) !== qCreatedAtTo.getTime()) {
      newFilter.createdAtTo = qCreatedAtTo;
    }
    if (Object.keys(newFilter).length !== 0) {
      store.dispatch(gallerySetFilter({ ...filter, ...newFilter }));
    }
  }

  if (query.image) {
    const imageId = parseInt(query.image, 10);
    if (store.getState().gallery.activeImageId !== imageId) {
      store.dispatch(galleryRequestImage(imageId));
    }
  }
}

function serializePoints(points) {
  return points.map(point => serializePoint(point)).join(',');
}

function serializePoint(point) {
  return point && typeof point.lat === 'number' && typeof point.lon === 'number'
    ? `${point.lat.toFixed(5)}/${point.lon.toFixed(5)}` : '';
}

function latLonEquals(ll1, ll2) {
  return !ll1 && !ll2 || ll1 && ll2 && ll1.lat === ll2.lat && ll1.lon === ll2.lon;
}
